---
title: 'Designing the message state machine before the chat UI'
excerpt: 'Sending, sent, failed. Most chat clients model the first two and let the third quietly corrupt the list.'
tags: ['system-design', 'react', 'signalr']
status: published
publishedAt: '2026-06-18'
updatedAt: '2026-06-18'
---

A chat client is a distributed system with a text input attached. The interesting design work is not the bubbles, it is deciding what a message *is* while the network is still deciding whether it happened.

## The naive version

Push the message into the list, fire the hub call, replace it when the server echoes back. That works until the echo arrives before the local write, or never arrives at all.

```ts
type Message = {
  id: string;          // server id, or a client uuid while pending
  clientId: string;    // never changes — this is the reconciliation key
  status: "pending" | "sent" | "failed";
  body: string;
};
```

The fix is `clientId`. The server echoes it back, so reconciliation is a lookup rather than a guess based on text and timestamp. It also makes retries idempotent: the server can recognise a duplicate send instead of creating a second message.

## Failure is a state, not an exception

A failed send stays in the list, greyed, with a retry affordance. Removing it is worse: the user watched themselves type it.

- Pending messages sort by local time.
- Sent messages re-sort by server sequence.
- Failed messages hold their position and never re-sort.

> Unread counts are the same problem wearing a hat. Derive them from the last read sequence, never by incrementing a local counter — a counter drifts the first time a reconnect replays messages you already saw.

Sub-second updates with no polling, and the list stays honest when the connection does not.
