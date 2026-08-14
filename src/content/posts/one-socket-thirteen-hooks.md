---
title: 'One socket, thirteen hooks'
excerpt: 'Notes from building a real-time chat frontend, including the rewrite I had to do on my own code.'
tags: ['react', 'signalr', 'frontend', 'state-management']
status: published
publishedAt: '2026-08-14'
updatedAt: '2026-08-14'
---

I spent the last few months building the chat module for an internal crew-management platform, and this post is my attempt to write down what I learned before I forget the parts that hurt.

It's a React 18 app. TypeScript, Vite, Tailwind, and `@microsoft/signalr` for the real-time bits. Group chat: conversation list on the left, thread on the right, typing indicators, read receipts, media uploads, the usual shape.

I'd built plenty of forms and tables before this. I had not built anything where the server pushes state at me while the user is also changing it. That turned out to be a completely different job, and about a third of what I wrote in the first version was wrong in ways I couldn't see until much later.

So this is the frontend view. Not "here's how to architect chat," because I didn't architect chat. More like: here's what I had to understand to write the client, here's the version I got wrong, and here's what I'd tell myself six months ago.

---

## The infrastructure, as someone who'd never seen any of this

I want to start here because I think it's underrated advice for anyone junior. Before I wrote a line of chat code, I spent a couple of days reading the deployment config and drawing the system out until I could explain it to myself.

I'm not an infrastructure person. I read `docker-compose`, the pipeline YAML, and `Program.cs` the way you read a language you can order food in but not argue in. Here's what I got out of it.

The frontend is a static build. `vite build` produces a `dist/`, a CDN host serves it, and every non-asset path rewrites to `index.html` so client-side routing works. The API base URL is baked in at build time as an env var, which means dev and prod are different builds, not the same build reading different config. Took me a while to internalise that.

The backend is one ASP.NET Core container. Auth is JWT Bearer. There's a SignalR hub, SQL Server behind Entity Framework, and blob storage for media.

Two things from that exercise turned out to matter enormously for my work.

**The first: media doesn't go through the API.** When you attach a photo, the backend hands the browser a pre-signed upload URL and the browser uploads the bytes straight to blob storage. I asked why, mostly because it made my upload code more complicated than I wanted. The answer was that if uploads went through the API container, a few people sending videos would tie up request threads for the whole duration of the transfer, and those are the same threads serving every other feature in the product. So the backend does a few milliseconds of work issuing a URL, then steps out of the way.

I hadn't thought about a web server as a thing with a finite number of hands before. Now I do.

**The second: I found a scaling limit in the diagram and it took me a week to work up the nerve to ask about it.**

SignalR's default setup keeps group membership in the memory of whichever process owns your connection. I only noticed we were on that default because I was reading the SignalR docs trying to understand groups, the docs kept mentioning backplanes, and I couldn't find one in our code.

Here's what I eventually understood it to mean:

![Why in-memory SignalR groups break on scale-out](/assets/chat/02-backplane-gap.svg)

With a single instance that's fine, because every connection is in the same process. Add a second instance and Alice's connection might land on instance 1 and Bob's on instance 2. They're in the same room. Alice sends a message, instance 1 broadcasts to its own in-memory copy of that group, and Bob isn't in it. Bob gets nothing.

No error. No failed health check. The message is safely in the database, so Bob sees it whenever he reloads. From the user's side it just reads as "chat is laggy sometimes," which is one of the worst bug reports to receive. I've written up the mechanics separately in [Scaling SignalR past one instance](/writing/scaling-signalr-past-one-instance).

I sat on this for days because I assumed I'd misread something. I'm the junior. Surely someone had thought about it. When I finally asked, it turned out yes, someone had thought about it: running a single instance was a deliberate choice, and adding a backplane means another service to provision, secure, monitor and pay for, to solve a problem we don't have yet.

Which is a fine answer. What I pushed on, and I'm glad I did, was whether it was written down anywhere. Because the risk isn't the single instance. The risk is someone enabling an autoscale rule eighteen months from now, during an incident, at 2am, and having no idea that chat is about to half-break in a way nothing will alert on.

It's in the infrastructure doc now, with the trigger condition spelled out, so the decision to scale out and the decision to add a backplane are the same decision. That's the single most useful thing I did that quarter and it wasn't code.

> TODO before publishing  confirm instance count is still pinned, and that the ceiling note in the infra doc is current.

The thing I took away: as a junior you will find things that look wrong. Usually there's a reason and you'll learn it. Sometimes there's a reason and nobody wrote it down, which is almost as bad as no reason at all. Asking costs you five minutes of feeling stupid.

---

## Connecting was harder than I expected

I assumed the socket was the easy part. Open connection, listen for events, render. It's about four lines in the SignalR quickstart.

Three things got me.

### The token can't go in a header

Every REST call in the app sends `Authorization: Bearer <token>`. The browser's WebSocket API can't set custom headers on the handshake. There's no clever workaround, it's just not part of the API.

SignalR's answer is `accessTokenFactory`, which puts the token in an `access_token` query parameter instead. It works, and it made me twitchy, because query strings turn up in access logs and browser history in a way headers don't.

Two things settled it for me. Everything's over TLS, so it's encrypted in transit. And `accessTokenFactory` is a function, not a value: SignalR calls it again on every reconnect, so a token that expired while the connection was open doesn't silently strand you.

I still think it's the weakest part of the connection setup.

> TODO before publishing  check whether the access logs actually record query strings. If they do, that needs scrubbing before this paragraph goes out.

### Groups belong to the connection, not the user

This one cost me a genuinely embarrassing amount of time.

When the server adds you to a room group, it's adding your *connection ID*. Not your user. Not your session. So when a phone drops to cellular and SignalR reconnects underneath you, you get a new connection ID and the server has no memory that you were in room 42.

The client reconnects. The UI says connected. The user stops receiving messages and has no idea why.

So reconnecting isn't just reopening a socket. It's rebuilding state: reconnect, rejoin the open room's group, refetch anything missed over REST, and only then start trusting what comes down the wire.

### The mental model that fixed the rest

It clicked when I stopped thinking of the socket as where messages come from.

The database is where messages are. The socket is a shortcut so you don't have to poll. If the socket misses something, the REST endpoint still has it, and the client can always ask.

Once I had that, a whole category of worry went away. The socket is allowed to drop things. It's allowed to be briefly wrong. What isn't allowed is the client having no way to catch up.

---

## The client only joins one room

This is the piece of the design I think is most worth explaining, partly because it's counterintuitive and partly because it costs us a feature people notice.

Here's the situation. A user has, say, 200 conversations. The list on the left has to update live: a message lands in room 137, that row jumps to the top with a preview and an unread badge, while the user is reading room 12.

The obvious way to build that is to join a SignalR group for every room the user belongs to. Then every broadcast reaches them and the list just works. That's what I did first.

It works. It also means 200 group memberships per connection, re-established on every reconnect, and every message in every room pushing a full message payload (body, attachments, reply metadata, sender info) down a socket that's going to use about six fields of it to draw a one-line row.

What we do instead is two channels:

![Two inbound channels: the room group carries full messages, the personal group carries previews](/assets/chat/01-two-channels.svg)

`ReceiveMessage` goes to the **room group**, and the client only joins the room it currently has open. Full message payload. This feeds the thread.

`ReceiveMessagePreview` goes to the user's **personal group**, which never changes. Light payload: room ID, preview text, unread hints. This feeds the list.

So a connection holds two group memberships instead of two hundred. On reconnect it rejoins two things instead of two hundred. And a user with 500 conversations costs the same as a user with 5, which is the property I actually care about.

### What it costs

Typing events are broadcast to the room group. Since the client only joins the room it has open, we cannot show "Sarah is typing" for a room further down the list. WhatsApp does that. We can't.

That isn't a bug and it isn't an oversight, it's the direct consequence of the thing I just described, and the fix is known: route typing through the personal group the way previews are routed. It's on the list.

There's a smaller one that wasted an afternoon of my life. The hub excludes the sender's own connection from typing broadcasts, but not the same user signed in somewhere else. So the client also has to check that the sender isn't you. I discovered this by testing with the same account in two browser windows, seeing nothing, and concluding typing was completely broken. It was working fine.

I've started asking "what does this decision cost me" as a habit, because for a while I only tracked what decisions bought.

---

## The rewrite

The chat frontend is on version 3. I wrote version 2. Version 2 was the problem.

### What v2 was

One hook. `useChat()`. It owned rooms, messages, the socket, typing, read receipts, the composer, media and navigation, and it kept growing, because every new feature had an obvious home: right there, next to everything else.

The thing that actually broke it was message state. Scattered across that file were dozens of `setMessages(prev => ...)` calls, one wherever a call site happened to need one.

Which meant the rule for "is this incoming message new, or a duplicate of my optimistic bubble, or an edit of something already on screen" was written separately, slightly differently, in every place that needed it.

They drifted. Of course they did. The symptom was a bug I couldn't reproduce on demand: sometimes another person's edit wouldn't show up until you reloaded the room. One of those updaters was treating a re-broadcast edit as a duplicate and quietly discarding it.

That took me two days to find, and I only found it by adding logs to every single updater and reading through the output.

### What v3 is

`useChat()` isn't a state file anymore. It's a wiring function. It calls thirteen focused hooks in dependency order and hands the results down through a context.

![Frontend layering: page, panes, provider, orchestrator, hooks, edges](/assets/chat/03-fe-layers.svg)

Six layers, flowing one way:

1. `chat.page.tsx`: layout and header.
2. `containers/chat-panes`: the conversation list pane and the active pane.
3. `chat.service.provider`: calls `useChat()` once for the whole subtree.
4. `chat.service` (`useChat`): the wiring. Refs, hook order, derived values.
5. `hooks/`: thirteen files, one concern each.
6. The edges: `state/` (two pure reducers, no React at all), `realtime/` (the SignalR socket wrapper), `repository/` (the REST client).

Two rules hold it up.

No component touches the socket or the repository. Everything goes through `useChatContext()`. If a component could reach the hub directly, the layers would be decoration.

And `useChat()` is called exactly once, in the provider. Calling it twice opens a second hub connection, which means two sets of handlers and every message rendered twice. The provider isn't there for tidiness. It's there so a second call isn't possible.

### Where the rules live now

All those scattered updaters became two pure reducers, `rooms.reducer.ts` and `messages.reducer.ts`. Plain functions. State in, state out, no hooks, no React.

`messages.reducer.ts` holds two rules that used to be folklore:

**One ID, one message.** An incoming message is matched against the pending optimistic bubble and replaces it, rather than appearing next to it. One implementation, applied to every path.

**Never silently drop a message.** A delete leaves a tombstone instead of removing the row, because removing it re-flows the thread under someone who's mid-read and scroll-jumps them. And an incoming edit for a message we already have is an update, not a duplicate. That's the exact v2 bug, and it's now impossible to reproduce because there's only one place the rule exists.

Because they're pure functions, both are unit-testable with no rendering, no mocked socket, no fake timers. The hardest logic in the module is testable in isolation. That alone was worth the rewrite.

### What I actually learned from it

I don't think v2 was stupid. It was the right size for the feature when I started it, and I'd still rather ship something small and coherent than build for requirements nobody's agreed to yet.

What I missed was the moment it stopped fitting. There was a point where "just add it to `useChat`" went from being the obvious choice to being the lazy one, and I walked straight past it, because every individual addition was tiny.

Nobody tells you when to restructure. And the signal isn't file length, which is what I'd been half-watching. The signal is when the same rule starts having more than one implementation.

---

## Four patterns I kept reinventing

Once the module was split up, the same four patterns showed up in nearly every file. Not because I planned it. Because that's what async UI needs.

### Handler refs

React callbacks get a new identity on most renders. Attach them to the socket directly and you either re-subscribe constantly (detaching and reattaching listeners while messages are arriving) or subscribe once and capture stale state forever.

```ts
const handlersRef = useRef(handlers);
useEffect(() => { handlersRef.current = handlers; });

// attached once, always runs the current version
socket.on("ReceiveMessage", (msg) => handlersRef.current.onMessage(msg));
```

Listeners attach once for the life of the connection and always run current logic. The socket wrapper itself is built once with `useMemo` and stays up.

There's a bonus I didn't expect: it also solves declaration order. `loadRoomMoreRef` gets read inside a handler that's defined above the function it needs. A ref sidesteps that entirely.

### Request IDs

The user types "and" in room search, then switches tabs. The response for "and" is still in flight. It lands after the tab switch and overwrites the list they're now looking at.

```ts
const id = ++requestIdRef.current;
const data = await fetchRooms(...);
if (id !== requestIdRef.current) return;  // superseded
dispatch({ type: "page/loaded", data });
```

The framing that made this click: a superseded request isn't cancelled, it just loses the right to publish. It can finish, it can succeed, it simply doesn't get to touch state or clear the loading flag anymore. Only the newest request owns the result.

I'd tried to do this with abort controllers first and got it subtly wrong. Aborting is a race. A counter isn't.

### In-flight flags

Scroll fires dozens of times a second. Infinite scroll without a guard requests the same page over and over and appends it multiple times.

```ts
if (append && inFlightRef.current) return;
```

Note the `append &&`. It gates load-more only, never the first load. I got that wrong initially and blocked first paint on a room whose previous fetch hadn't settled. Which didn't look like a bug. It looked like the app being slow, and that's much harder to trace.

Narrow guards. Always.

### Optimistic, then reconciled

The message appears the instant you hit Enter, as a pending bubble with a temporary ID. When the broadcast comes back, the reducer matches it and swaps it in place. If the send fails, it rolls back.

Same shape for edits and deletes: apply straight away, undo on failure.

> TODO before publishing  describe what a failed media delete actually restores. I believe it puts back attachment state as well as the message body, but write what the code does, not what I remember.

---

## The order of `selectConversation`

Switching rooms is seven steps. They look like a checklist. They're a dependency chain, and every one is where it is because putting it elsewhere caused a bug.

**1. Announce we stopped typing, for the room we're leaving.** Do this after leaving the group and the event goes to a group you're no longer in, so the old room shows you typing forever.

**2. Set the active ID and switch the right pane back to the thread**, whatever it was showing.

**3. Reset the composer and clear typing state.** The draft, a quote aimed at a message, an edit in progress, and everyone else's typing indicators all belonged to the room you're leaving. All of them go, or you get a reply quote pointing at a message that isn't in the room you're now in.

**4. Flush pending read receipts.** They're debounced. Anything still batched has to go now, because that room is about to stop receiving broadcasts.

**5. Dispatch "room opened," with `wasUnread` read from a ref.** This is my favourite one. React can call an updater more than once (Strict Mode does it on purpose). If the tab's unread count decremented inside the updater, a double call would decrement twice, and the badge would drift down and never recover. Reading from a ref means the decision gets made once, outside.

**6. Leave the previous room's group.** Only the open room is joined, so the old one has to be released. Miss this and its full broadcasts keep arriving alongside the preview the list already gets, and everything counts twice.

**7. Join and open the new room.** A failed join is surfaced scoped to the room it failed for, so a stale error banner can't hang over a different room the user has since navigated to.

Step 5 is the one I'd point at in an interview. It isn't a chat problem or a SignalR problem. It's a React correctness problem hiding inside one. Reducer updaters have to be pure and safe to run twice, and the moment you put a decision in one that shouldn't happen twice, you've written a bug that shows up as "the badge is sometimes wrong" and eats a day.

---

## Sending a message is three different things

`sendMessage()` is one button and three branches.

![sendMessage: text, reply, and the three-step media path](/assets/chat/04-send-message.svg)

**Text.** Optimistic bubble, send over the hub, reconcile when the broadcast comes back.

**Reply.** Same, plus a target. One trap: the reply target gets read into a local variable *before* the composer clears, because the async path still needs that ID long after the callback has returned. I found that by clearing state slightly too early and watching replies lose their quotes.

**With media.** Three steps, and you can't skip any of them.

1. Ask the backend to prepare the upload. It returns a pre-signed URL.
2. `PUT` the bytes straight to blob storage from the browser.
3. Call `SendMessageWithMedia`. *This* is what creates the message and broadcasts it.

Step 3 is the one that bit me. Steps 1 and 2 succeed happily on their own and the bytes sit in storage, but no message exists and nothing appears. It looks like the upload silently failed when actually it worked perfectly and I just never told anyone about it.

### The count guard

```ts
if (uploads.length !== files.length) throw ...
```

If some uploads failed, a short array would send a message with fewer attachments than the user picked, and it would look like success. A visible failure beats a silent one every time. People can retry an error. They can't retry something they don't know went wrong.

### Two fields I keep from local state on purpose

Small things, real reasons.

`attachments` stays as local object URLs instead of switching to the broadcast's CDN links right away, because the storage write can still be settling and the CDN link briefly 404s. The sender would watch their own photo break for a second.

`replyTo` stays local because the broadcast doesn't echo it back. Taking the server payload wholesale would strip the quote off your own reply the instant the server answered.

Both are the same shape of bug: the server echo is authoritative for most fields, and treating "most" as "all" gives you a UI that corrects itself into being wrong.

One more, worth a comment in the code: the request field is `replyId`, not `replyMessageId`. It doesn't match our client-side name. That mismatch cost me an hour and it's the kind of thing that's invisible in review, so it's commented now.

> TODO before publishing  confirm the field names in both directions: `replyId` on the request, and what the broadcast does or doesn't carry back. Getting this backwards in public undermines everything near it.

---

## Edits arrive twice and I kept both handlers

An edit reaches the client two ways: a dedicated edit event, and a re-broadcast of the message itself. Both land.

The instinct is to delete one. I kept both, and had to think about why.

They both go through the same ID-keyed merge, so the second one is a no-op. It costs nothing.

If I only handled the re-broadcast, then the day the backend stops double-sending (a perfectly reasonable optimisation someone might make next quarter) the client loses the ability to tell an edit from a new message. The bug would appear nowhere near the change that caused it and nobody would connect the two.

The idempotent merge is what makes tolerating the duplicate free. I've started thinking of idempotency less as a correctness tool and more as the thing that lets you relax about stuff you don't control.

It's on the backend gap list, with the cleanup noted: about fifteen lines of merge logic and one comment paragraph go away the day the broadcast carries the field properly.

---

## The constants file

Every tuning number sits at the top of the hook that owns it. No bare numbers buried in logic.

```ts
ROOMS_PAGE_SIZE       = 20
HISTORY_PAGE_SIZE     = 50
MEDIA_PAGE_SIZE       = 40
SEARCH_DEBOUNCE_MS    = 300
MARK_READ_DEBOUNCE_MS = 1000
TYPING_PING_MS        = 3000
TYPING_IDLE_MS        = 3000
```

Most of those are feel. One isn't, and I only learned why after I'd already written it.

`MARK_READ_DEBOUNCE_MS`. Marking a message read opens a database transaction. In a busy room, messages arrive in bursts, so nine messages might land in a second while someone reads. Without the debounce that's nine transactions from one person doing nothing but looking at their screen, multiplied by every reader in every active room.

Debouncing collapses it to one transaction per second per reader, and nothing is lost, because only the highest message ID in a burst matters. Reporting the last one is the same as reporting all nine.

Someone on the backend pointed this out to me. It stuck because it means a number in my frontend code is a number in their write load. If I'd dropped that debounce to 200ms to make the ticks feel snappier, nobody reviewing the frontend diff would have caught it.

### Search is a server call, not a filter

Room search hits the API, debounced at 300ms. It's not a client-side `filter()`.

That's forced, not chosen. The list is cursor-paginated, so the client never has all the rooms. You can't filter an array you don't have.

The same constraint explains something that looks like a missing feature: there's no client-side sort either. A cursor-paginated list can only be ordered by the key the cursor walks. Re-sorting a page in the browser gives you an order that's right within the page and wrong across page boundaries, which is a bug that only shows up once you scroll far enough. So it ships.

### The store is split in two

`conversationsById` holds every room touched this session. `visibleIds` holds what the current tab and search should show. The list renders `visibleIds` resolved against `conversationsById`.

Keeping them apart is what lets the open room hold a full record while list rows carry only preview fields. It also means switching tabs changes which IDs are visible without throwing away data you'd just have to fetch again.

---

## What's still wrong

Easy to write one of these as a list of good decisions. Here's the other list.

**Optimistic bubbles are matched on sender and content.** When the broadcast comes back, the reducer pairs it with the pending bubble using sender plus message body. Send "ok" twice quickly and the matching is ambiguous. It should use the client-generated ID end to end, with the server echoing it back. This is the first thing I'd fix, and it needs a backend change too, which is why it hasn't happened yet. It's also the bug I'd be least surprised to see reported.

**Some features are local fakes.** `promoteMember` updates the role badge in local state only, because there's no endpoint yet, so a reload reverts it. Archiving does an optimistic move and then re-lists from the server because there's no unarchive. These are documented compromises rather than hidden ones, but users don't read our docs. Optimistic UI over an endpoint that doesn't exist is a lie the interface tells, and I'd rather disable the control than ship the lie. I haven't made that argument yet. I should.

**Media filenames are borrowed.** The media panel takes real filenames from whatever messages happen to be loaded. The same file shows a UUID in the panel and its real name in the thread, depending on how far you've scrolled.

**Group read receipts don't exist.** The read tick only appears in one-to-one conversations, because read state is stored per room rather than per reader. In a group we can't say who's read what, so we correctly show nothing. Correctly showing nothing is still a missing feature.

**Frontend deploys come off my laptop.** The backend has a proper pipeline: branch trigger, secrets from a vault, container build, registry push, host pulls the image. The frontend goes out with a deploy command from a terminal. There's no artifact trail for what shipped when, and if I'm on leave, nobody's completely sure how to release.

I didn't write that list to look humble. I wrote it because I went looking for the compromises while drafting this post, and found that several of them had been sitting quietly in my own code for months without anyone rereading them, me included. Writing a compromise down is half the job. Rereading the list is the other half, and that's the half I'd been skipping.

---

## The part that isn't code

Most of what made this module better came from other people, so it'd be odd to write three thousand words and leave that out.

I wrote a design doc before the rewrite. Layering, call order, the whole thing, put in front of the team before I touched anything. Two things came back that I hadn't considered, and the one I still think about was: "why does `useChat` have to be called in the provider specifically?" My honest answer at the time was that it seemed tidier. Working out the real answer, that a second call means a second socket and every message rendered twice, turned a preference into a guarantee. I only got there because someone made me justify it.

The backend gap list has been more useful than I expected. It's a table of things the frontend works around, what each workaround costs, and what gets deleted when the backend changes. It reads as a shared picture of the seam between two parts of the system rather than a complaint. Framing something as "here's what your fix removes for me" instead of "here's what you haven't done" changed those conversations more than I thought it would.

On taking feedback: the backplane conversation was the most useful thing anyone said to me on this project, and my first reaction was defensive, because I'd already shipped around it. The better reaction, which I got to a few minutes later, was that someone had just handed me the most important fact about the system I was working in.

On giving it: I mostly ask questions rather than assert things, because I'm usually the one missing context. "What happens if this fires twice?" has found me more real bugs than "this is wrong" ever has, and it costs nothing when I turn out to be the one who's mistaken.

---

## Where I'm at

Three things I'd keep if I lost everything else.

The database is where messages are, and the socket is a shortcut. Once I stopped treating the socket as the source of truth, most of my anxiety about the design went with it.

Every decision has a bill. Joining one room group instead of two hundred bought flat scaling and cost us list-wide typing indicators. Same decision, seen from the other side.

Order is the logic. In `selectConversation`, in the upload, in reading `replyTarget` before clearing the composer. The steps aren't a checklist. The sequence is the design, and each step is where it is because somewhere else caused a bug.

I'm still early in this. I got things wrong, some of them are still in the codebase, and the list above is the honest state of it. But I'd rather be the developer who can tell you where my code breaks than one who's never gone looking.

---

I'm looking for a junior software engineer role, frontend or full-stack, based in Bali, Indonesia and open to remote. If you're building something with hard real-time or state-sync problems in it, I'd like to hear about it: [hapsari.laksmiw@gmail.com](mailto:hapsari.laksmiw@gmail.com), [LinkedIn](https://www.linkedin.com/in/hapsarilw), or [GitHub](https://github.com/hapsarilw).

And if you've built chat before and I've got something wrong here, please tell me. That's most of why I wrote it.
