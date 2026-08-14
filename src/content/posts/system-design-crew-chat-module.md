---
title: 'System design: the chat module in a crew communication portal'
excerpt: 'One container, one SignalR hub, two databases, and a media path that never touches the API. Here is the whole shape, and the one constraint that decides everything else.'
tags: ['system-design', 'signalr', 'azure', 'architecture']
status: published
publishedAt: '2026-07-22'
updatedAt: '2026-07-22'
---

Crew Connect is a portal for offshore crews: rosters, forms, pool management, and a chat module that has to work over a satellite link. The chat is the part people judge the product by, so it is worth drawing the whole system before talking about any single feature.

![Crew Connect infrastructure — frontend, backend, data stores, and the third-party services around them](/assets/crew-connect-infrastructure.png)

## The layers, briefly

A React SPA is served as static output from Vercel. Every non-asset path rewrites to `index.html`, and the API base URL is injected at build time rather than discovered at runtime.

The backend is a single ASP.NET Core container on Azure App Service. Auth, Chat, Pool, Form, Metadata, and admin all register as modules **inside one process** — not separate microservices. For a team of this size that is the right call: one deploy, one set of logs, no distributed transaction to reason about when a message send also has to write a notification.

```
Browser (React SPA, Vercel)
   │  REST + WebSocket
   ▼
Azure App Service — CrewConnect.API (Linux container)
   ├── CORS → AuthN (JWT Bearer) → AuthZ
   ├── Controllers   /chats, /contacts, …
   └── SignalR Hub   /hubs/chat
        │
        ├── SQL Server      (EF Core, OLTP — messages live here)
        ├── Fabric DB       (read models, synced in background)
        └── Blob Storage    (media, via SAS URL — bytes skip the API)
```

## The constraint that shapes everything

The hub is registered with a plain `AddSignalR()` — no Redis, no Azure SignalR Service, no backplane of any kind. Group membership therefore lives in the memory of **one** instance.

> This design is correct for exactly one App Service instance. Scale out to two and half your connections stop receiving broadcasts, because the instance that owns the group is not the instance that received the send.

That is not a bug to fix later; it is a documented ceiling. It means the scaling plan has to be written down next to the deployment config, so the person who eventually clicks "scale out" knows what they are buying.

## Why media never goes through the API

A chat with photo attachments is a file-transfer product wearing a messaging hat. Routing bytes through the API container would make request timeouts, memory, and deploy windows all a function of how large a photo someone took.

So the browser asks the backend for a SAS URL, uploads **directly** to Blob Storage, and sends the resulting URL as the message payload. The API only ever handles strings. Video takes one extra hop through Bitmovin for transcoding, so a phone-recorded clip plays on a ship laptop.

```ts
// 1. ask for a scoped, expiring upload target
const { uploadUrl, blobUrl } = await api.post("/chats/media-token", {
  chatId, contentType: file.type,
});

// 2. bytes go straight to storage — the API is not in this path
await fetch(uploadUrl, { method: "PUT", body: file });

// 3. the message itself is just a reference
await hub.invoke("SendMessage", { chatId, clientId, mediaUrl: blobUrl });
```

## Two databases, two jobs

SQL Server via EF Core is the source of truth for every module, chat included. A second store, Fabric DB, is kept in sync by a background service and exists so that reporting and analytics queries never compete with the write path for the same locks.

The rule I would write on the wall: **one writer, many readers, and the readers are allowed to be stale.** A chat message must be durable the instant it is acknowledged. A dashboard counting messages per vessel can be a minute behind and nobody notices.

## Notifications are a fan-out, not a feature

Every new message triggers a push through Azure Notification Hub in parallel with the SignalR broadcast — because the people who most need the message are the ones with the app closed. Transactional email goes out through Azure Communication Services for the non-push cases, like an invitation to a new chat.

Two things matter here. The push is fired **alongside** the broadcast, not after it, so a slow push provider cannot delay the in-app message. And the push carries an identifier rather than the message body, so the client fetches current state instead of rendering a payload that may already be stale or redacted.

## What I would change next

1. Put a backplane in before anyone needs to scale out, not after.
2. Tighten CORS — allow-all is fine in development and indefensible in production.
3. Add real tracing. There is a `/health` endpoint aggregating both database contexts, but no distributed tracing, so a slow send is currently diagnosed by reading code rather than a span.

None of those are rewrites. That is usually the sign that the original shape was right: the improvements are additions, not replacements.
