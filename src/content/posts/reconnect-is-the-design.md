---
title: 'Reconnect is the design, not the edge case'
excerpt: 'On a satellite link the connection drops constantly. What the client does in those forty seconds is the whole product.'
tags: ['system-design', 'real-time', 'reliability']
status: published
publishedAt: '2026-05-28'
updatedAt: '2026-05-28'
---

Offshore connectivity is not slow so much as intermittent. Planning for a healthy socket and treating the drop as an error path gets the priorities exactly backwards.

## Three questions a reconnect has to answer

1. What did I miss while I was gone?
2. What did I send that never landed?
3. What should the user see while I work it out?

Only the third is a UI problem, and it is the one most implementations spend all their effort on.

## Sequence numbers, not timestamps

Client clocks on shared vessel laptops are wrong often enough that timestamps cannot order anything. The server assigns a monotonic sequence per chat; the client stores the highest one it has seen and asks for everything after it.

```ts
hub.onreconnected(async () => {
  const since = store.lastSeq(chatId);      // never a Date
  const missed = await api.get(`/chats/${chatId}/messages?after=${since}`);
  store.merge(missed);                      // keyed by clientId + seq
  await resendPending(chatId);              // idempotent by clientId
});
```

## The banner is part of the contract

A quiet connection state is worse than a broken one, because the user keeps typing into a void. A thin persistent bar — reconnecting, then syncing, then gone — costs almost nothing and turns a mystery into a wait.

> Design the offline state as a first-class screen. If the only way to see it is to unplug your laptop, nobody on the team has ever really looked at it.
