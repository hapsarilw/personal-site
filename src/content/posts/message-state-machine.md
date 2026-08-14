---
title: 'What I actually learned about system design'
excerpt: 'A feature worked perfectly on my laptop and fell over the moment real people used it. That was the day system design stopped being a buzzword.'
tags: ['system-design', 'architecture', 'scalability']
status: published
publishedAt: '2026-08-14'
updatedAt: '2026-08-14'
---

A year ago, if you'd asked me what "system design" meant, I would have said something confident and mostly wrong. I thought it was a whiteboard ritual reserved for staff engineers with grey hair and strong opinions about databases. Something you studied to pass interviews, then never touched again.

Then I shipped a feature that worked perfectly on my laptop and fell over the moment real people used it. That was the day system design stopped being a buzzword and became the thing I think about every single day.

I'm still junior. I get things wrong regularly. But I've learned enough, and broken enough, to have opinions worth sharing — so here's what I wish someone had told me earlier.

## System design isn't diagrams. It's decisions.

Here's the reframe that changed everything for me.

When I started, I thought system design was about *drawing boxes*. Load balancer here, database there, draw an arrow, done. But the boxes are the easy part. Anyone can draw boxes.

System design is really about the **decisions and trade-offs** underneath those boxes. Every arrow you draw is a decision you're quietly making: *this can be slow, that must be fast, this can fail, that absolutely cannot, we'll spend money here to save time there.*

Good design isn't the one with the most components. It's the one where someone thought carefully about what breaks, what waits, and what happens when ten thousand people show up at once instead of ten.

The best senior engineer on my team once reviewed a design of mine and asked a single question: *"What happens to this when the database is slow?"* I didn't have an answer. That question taught me more than a month of tutorials. Good system design is mostly the discipline of asking that kind of question *before* production asks it for you.

## The mental shift: from "does it work?" to "does it work when things go wrong?"

As a beginner, I optimized for one thing: does the code run? Green checkmark, feature works, ship it.

Production has a different question. It doesn't care that your feature works when everything is calm. It cares what happens when the database is under load, when a downstream service times out, when a user double-clicks the submit button, when traffic spikes 20x because someone posted your app on social media.

The shift from *"does it work?"* to *"does it work under stress and failure?"* is, I think, the single biggest jump from junior to competent. Everything else is details.

## The anatomy of a system that survives traffic

Let me show you the mental model I actually use now. This isn't a specific product — it's the shape most real systems settle into, and understanding *why* each piece exists is worth more than memorizing the picture.

![How a request moves: CDN, load balancer, stateless app servers, a cache, a queue, and split database reads and writes](/assets/system-design-diagram.png)

Follow a single request through it, because that's what finally made it click for me:

**The edge (CDN) is your first line of laziness — in a good way.** The fastest request is the one your servers never have to handle. If something doesn't change per-user — an image, a stylesheet, a public page — serve it from a CDN close to the user and let your actual application sleep. I ignored this for months and wondered why my servers were busy doing nothing important.

**The load balancer exists so no single server is a hero.** It spreads incoming traffic across many identical app servers. The key word is *identical*: which brings us to the most underrated idea I learned.

**App servers should be stateless.** This one embarrassed me. Early on I stored a user's session data *in the memory of the server that handled their login*. Worked great — until the load balancer sent their next request to a different server that had never heard of them. Suddenly people were randomly logged out. The fix wasn't clever code; it was a design principle: **servers shouldn't remember anything important.** Push the state out to a database or a shared cache, and then you can add or remove servers freely. That's what "scaling out" actually means.

**The cache is where you admit the database is precious.** Databases are the slowest, most expensive, most fragile part of most systems. So before you ask the database anything, you ask the cache: *"Hey, do you already know the answer?"* Most of the time, it does. This is the difference between a page that loads in 30 milliseconds and one that loads in 300.

**The queue is how you stop making users wait for slow things.** When someone uploads a video or triggers a report, they don't need to sit there while it processes. You drop the job on a message queue, reply instantly with *"got it, working on it,"* and let background workers chew through it. Queues also absorb spikes — if a thousand jobs arrive at once, they wait in line instead of crushing everything.

**Splitting reads from writes keeps the database standing.** Most apps read far more than they write. So you send writes to a primary database and reads to replicas that copy from it. The database stops being a single choke point.

None of these pieces are exotic. What matters is understanding the *reason* each one exists — because then you can reach for the right one when a real problem shows up, instead of cargo-culting an architecture you saw in a blog post.

## The four questions I now ask about everything

I've boiled my whole approach down to four questions. I ask them out loud, in design reviews, even when I feel silly doing it:

**1. What happens when this gets popular?** Will it survive 10x the traffic, or does something quietly fall apart? You don't have to build for a billion users — over-engineering is its own mistake — but you should *know* where your ceiling is.

**2. What happens when this fails?** Not *if*. Networks blip, services time out, disks fill up. A good design assumes failure and degrades gracefully instead of collapsing. "Show a cached version" beats "show an error page."

**3. Where does the data live, and who's allowed to be wrong about it?** This is the consistency question. Does everyone need to see the exact same number the instant it changes (your bank balance), or is it fine if it catches up a second later (a like count)? Those two answers lead to completely different, and completely valid, designs.

**4. Can the next person understand this?** The cleverest architecture is worthless if nobody on the team can safely change it. Simplicity is a feature.

## The mistakes that actually taught me this

I want to be honest about how I learned all this, because it wasn't from being smart. It was from being wrong in public.

**I over-engineered before I understood the problem.** My very first "system design" at work had a message queue, a cache, and a background worker — for a feature that had about fifty users. I'd read that real systems have these things, so I added them. A senior pulled me aside, kindly, and said: *"This is a lot of machinery to keep alive for a problem you don't have yet. Build the simple thing. Add complexity when reality demands it, not before."* He was completely right. Now my default is the boring solution, and I make complexity earn its place.

**I cached data and forgot it could go stale.** I added a cache to speed up a page, felt like a genius, and then spent two days confused about why users were seeing old information. Nobody had told me the oldest joke in the field: there are only two hard problems in computer science, and one of them is knowing when to throw away what you cached. Caching isn't free speed — it's a trade you make against freshness, and you have to design for it.

**I built the thing that was fun instead of the thing that was needed.** More than once I reached for the interesting, scalable solution when a plain database query would have done the job for years. Learning to tell the difference between real scale problems and imaginary ones is, I think, a career-long skill. I'm only at the start of it.

I'm not proud of these in the sense of celebrating them — but I'm not ashamed of them either. Every one of them is now a question I ask *before* I write code. That's the whole point. The goal was never to stop being wrong. It's to be wrong earlier, cheaper, and out loud, where a teammate can catch it.

## The part nobody tells juniors: system design is a team sport

Here's the thing that surprised me most.

I assumed the best engineers designed systems alone — went quiet, thought hard, emerged with the answer. The reality is the opposite. The best designs I've seen came out of someone sketching a rough idea and then actively inviting people to poke holes in it.

I've had to learn two skills that have nothing to do with code:

**Taking feedback without taking it personally.** When someone finds a flaw in my design, they're not attacking me — they're saving production from finding it at 3 a.m. instead. I used to defend my designs. Now I try to be genuinely glad when someone breaks them on a whiteboard, because a whiteboard is a much cheaper place to fail than a live system. The engineers I respect most are the ones who say *"good catch, I hadn't thought of that"* the fastest.

**Giving feedback that helps instead of just critiques.** When I review a teammate's design now, I try to ask questions rather than issue verdicts. *"What happens to this when the queue backs up?"* opens a door. *"This is wrong"* slams one. I learned that from being on the receiving end of both. The version that made me better was always a question.

I still have more to learn here than I've learned. But I'm convinced that system design skill and communication skill grow together — because a design only exists to be understood, challenged, and maintained by other humans. A brilliant architecture that lives in one person's head isn't a system. It's a liability.

## What I'd tell myself a year ago

If I could go back, I'd keep it short:

You don't need to memorize architectures. You need to understand *why* each piece exists, so you can reach for the right one when a real problem shows up — and leave it on the shelf when it doesn't.

Assume things will fail, and design for the failure, not just the happy path.

Reach for the simplest thing that works, and make complexity prove it's necessary before you let it in.

And ask for feedback early and often, because being wrong on a whiteboard is a gift, and being wrong in production at 3 a.m. is a lesson you pay full price for.

I'm still a junior developer. I still get design reviews where someone spots something obvious I missed, and I still feel the little sting before the gratitude kicks in. But I've stopped seeing that as a sign I'm not good enough. I've started seeing it as exactly how this works — you design, you get humbled, you fix it, you get a little better, and you do it again with someone smarter than you watching your back.

That loop, honestly, is the best part of the job.
