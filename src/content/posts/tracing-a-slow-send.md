---
title: 'Tracing a slow message send'
excerpt: 'Draft  a health endpoint tells you the service is up. It does not tell you which of six hops ate 900ms.'
tags: ['system-design', 'observability']
status: draft
publishedAt: '2026-08-06'
updatedAt: '2026-08-06'
---

Notes toward a proper write-up. Right now the system exposes `GET /health` aggregating both database contexts, and nothing else  no spans, no APM.

## The six hops a send actually makes

1. Hub invoke over the socket
2. Authorisation and chat membership check
3. EF Core insert
4. SignalR broadcast to the group
5. Push fan-out to Notification Hub
6. Background sync into the read model

Without tracing, "sending is slow" is indistinguishable across all six. With one trace id threaded from the client, it is a glance.

TODO: embed the walkthrough recording here once it is edited.

https://www.youtube.com/watch?v=8aGhZQkoFbQ

TODO: decide whether the trace id comes from the client or the hub, and what it costs to log it on every message at crew-wide volume.
