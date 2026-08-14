---
title: 'When a second database earns its keep'
excerpt: 'Reporting queries and chat writes want opposite things. Splitting them is cheap; deciding what may be stale is the design.'
tags: ['system-design', 'databases', 'architecture']
status: published
publishedAt: '2026-04-30'
updatedAt: '2026-04-30'
---

Crew Connect runs two stores: SQL Server as the transactional source of truth, and a second analytical database kept in sync by a background service. That is not redundancy — it is two different access patterns refusing to share a lock.

## The pattern that forces the split

Someone asks for "messages per vessel per week, by department". Answered against the OLTP database, that query scans the same table the send path writes to, at exactly the hour crews are most active.

- Writes want narrow rows, tight indexes, short transactions.
- Reports want wide scans, denormalised shapes, and no urgency at all.

## What the sync service must guarantee

Not freshness. **Ordering and eventual completeness.** A read model that is two minutes behind is a product decision you can explain; one that is missing a random 0.3% of rows is a bug you will chase for a quarter.

```sql
-- read model: denormalised on purpose, rebuilt not patched
CREATE TABLE fact_message_daily (
  vessel_id    INT      NOT NULL,
  department   VARCHAR(64) NOT NULL,
  day          DATE     NOT NULL,
  message_count INT     NOT NULL,
  PRIMARY KEY (vessel_id, department, day)
);
```

## The honest trade

You have accepted a second thing that can break, a second schema to migrate, and a lag the business will eventually ask you to shrink. In exchange, no analyst can take down chat with a `GROUP BY`. On a system where the chat is the product, that is a trade worth making — and worth writing down, so the next person knows it was a choice.
