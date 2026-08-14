---
title: 'Scaling SignalR past one instance'
excerpt: 'In-memory groups are the default and the ceiling. What actually changes when you add a backplane.'
tags: ['system-design', 'signalr', 'scalability']
status: published
publishedAt: '2026-03-14'
updatedAt: '2026-03-14'
---

A plain `AddSignalR()` keeps group membership in process memory. One instance, and everything works. Two instances behind a load balancer, and a broadcast reaches only the clients that happen to be connected to the instance that received it.

## Why it fails quietly

Nothing throws. The send succeeds, the database row is written, the sender sees their own message. Only the other half of the room sees nothing — and they report it as "chat is laggy", which sends you looking at the wrong layer entirely.

```
Client A ──▶ Instance 1 ──▶ group "chat:42" (in memory of Instance 1)
Client B ──▶ Instance 2 ──▶ group "chat:42" (a DIFFERENT in-memory group)

A sends → Instance 1 broadcasts → B never hears it.
```

## The two real options

1. **Redis backplane.** Instances publish hub messages to Redis; every instance forwards to its own connections. Cheap, well understood, and now Redis is on your critical path for chat delivery.
2. **Azure SignalR Service.** Connections terminate at a managed service instead of your container. More expensive, far less to operate, and it removes socket count as a reason to scale the API.

## What changes in your code

Almost nothing — one registration line. What changes is what you must now think about.

- Message ordering is per-connection, never global.
- A backplane outage becomes a chat outage, so it needs its own alert.
- Sticky sessions stop being a fix and become a smell.

> The line of code is trivial. The reason to write it early is that adding it during an incident means learning your delivery guarantees under pressure.
