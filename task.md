Software Developer Co-op — Take-Home Assignment (Winter 2027)

# Software Developer Co-op — Take-Home Assignment (Winter 2027)

## Overview

**Time limit: 3 hours** (about 2.5 hours coding, 30 minutes on a short README). Please stop when the time is up. We want to see how you prioritize under a constraint, not a polished product.

You'll build a small React + TypeScript screen that helps a grower spot frost risk across their farm, then write a short explanation of your approach. This mirrors day-to-day co-op work at Semios: turning real agricultural data from an API into a clear, reliable UI.

### We are evaluating:

**How you organize code and data** — component structure, types, separation of concerns **How you handle real-world concerns** — loading, errors, empty states, larger data sets **How you test** — what you chose to test and why **How you use AI tools** — where they helped, where you had to correct them **How you communicate** — your write-up and commit history

## The scenario

A grower manages a farm split into **fields**. Each field has a few **weather stations**, and every station reports one **daily low temperature** in °C.

Cold nights can damage crops, so the grower watches for **frost risk**. For this exercise, a field is at frost risk if **any of its stations recorded a daily low of 0 °C or below** in the last 7 days.

"Today" is the AS_OF_DATE constant exported by the mock API, not your computer's clock. "The last 7 days" means the 7 days ending on AS_OF_DATE, including that day.

Your job: build the **Frost Monitor** screen. A grower opening it should be able to answer, within a few seconds:

1. Which fields are at frost risk right now?
2. Is it getting colder or warmer in a given field?
Page 1 of 7

3. Which stations are the coldest, and are any stations offline (not reporting)? You don't need to know anything about agriculture to complete this. If a detail is unclear, make a reasonable assumption and note it in your README.
## Data and mock API

There is no real backend. **We provide the mock API below**, so you can spend your time on the UI. Copy it into your project as src/api/mockApi.ts.

**Do not edit the mock API**, except for the FAILURE_RATE value. Treat it like a real backend you don't own: your code should work with it exactly as provided. If you think it should behave differently, say so in your README instead of changing it.

It behaves like a real network call:

Each call resolves after a random delay of **300–1500 ms**. Each call fails with an error **5% of the time**. This is deliberate: we want to see your loading, error and retry handling. Loading the overview takes a few calls, so expect roughly 1 load in 7 to show an error. Set FAILURE_RATE to 0 while you build, and to 1 to test your error state. The data is the same on every page load: 8 fields, 3–6 stations per field, 30 days of readings. The FIELDS list at the top of the file sets each field's usual daily low before this week and during the last 7 days, so you can read off roughly what to expect.

Endpoints

Function Returns Notes

All fields on the farm

|getFields()|Field[]|
|---|---|
|getStations(fieldIds?)|Station[]|
|getReadings(stationIds,|Reading[]|

Stations for the given fields, or all stations if no ids are passed

from, Daily lows for the given stations and to) date range (ISO dates, inclusive)

Some readings have lowTempC: null, meaning the station didn't report that day. How you treat these is up to you; explain your choice in the README.

Page a of 7


Page 4 of 7

```
export const getStations = (fieldIds?: string[]) =>
respond(fieldIds? stations.filter((s) => fieldIds.includes(s.fieldId)) :
stations);
export const getReadings = (stationIds: string[], from: string, to: string)
=>
respond(readings.filter((r) => stationIds.includes(r.stationId) && r.date
>= from && r.date <= to));
```
## Requirements

Use **React** and **TypeScript**. Any setup is fine (Vite is the quickest). Use any UI or charting library you like, or none — we care more about structure than visuals.

### Core (aim to finish these)

1. **Field overview** — a list or table of all fields showing name, crop, coldest daily low in the last 7 days (°C), and a clear indicator when a field is at frost risk. At-risk fields should be easy to find (sorted to the top, filterable, or both).
2. **Field detail** — selecting a field shows its stations with each station's recent daily lows and a simple trend (a sparkline, chart, or even up/down arrows). Offline stations (no reading on AS_OF_DATE or the day before) are flagged.
3. **Loading, error and empty states** — the mock API is slow and fails sometimes. The UI should never show a blank screen or crash. Users should be able to retry after an error.
4. **Tests** — at least **two meaningful tests**. We suggest one unit test for your frost-risk logic and one component or integration test. Use Vitest, Jest, React Testing Library, or similar.
5. **Accessibility basics** — the frost-risk indicator must not rely on colour alone, and the main flow should be usable with a keyboard.
## Written explanation

Include a short README.md (about one page; bullet points are fine). Save about **30** **minutes** for it. The working code is the main deliverable; the README helps us understand the engineering decisions behind it.

1. **Architecture** — How did you structure components, data fetching, state and types, and why? What did you build first, and what did you deliberately leave out?
2. **Edge cases and assumptions** — Where does the frost-risk logic live, and why there? How did you handle null readings, slow responses and failed requests?
3. **Scale and reuse** — What would break or slow down at 500 fields and 20,000 stations, and what would you change in rendering, data fetching and the API? Which components would you move into a shared component library?
4. **Testing** — Why these tests? What would you test next with more time? Also include the AI usage section described below.
## Using AI tools

**AI tools are allowed and encouraged.** Claude, Copilot, ChatGPT, Cursor or any other assistant is fine — our team uses them every day. What we want to see is how you work with them, not whether you avoided them.

In your README, add a short **AI usage** section covering:

Which tools you used, and for which parts (e.g. scaffolding, components, tests, styling) **One example where the AI output was wrong, incomplete, or not what you wanted**, and how you noticed and fixed it Anything you chose to write by hand, and why

You must be able to explain every line you submit. In the follow-up interview we may discuss your code together.

## Submission

Share a link to a **public Git repository** (GitHub, GitLab, or Bitbucket). If you prefer not to make it public, send a zipped repo **including the .git folder**. **Commit as you go.** Small commits with clear messages help us follow your thinking — please don't squash into one commit. The README must include: how to install and run the app, how to run the tests, the written explanation, and the AI usage section. Note the **actual time you spent** at the top of the README. Going a little over is fine; just tell us.

Reply to the email you received this assignment from with your link within **10 days** of receiving it. If that clashes with midterms or other exams, tell us and we'll agree on a later date.

## Notes

**This is a time-boxed exercise.** A full version of this screen could take a team weeks. We expect you to finish the core items at a basic level and skip some polish — tell us what you'd do next rather than letting the work run over. **Process over perfection.** We are not grading pixel-perfect design or the cleverest algorithm. We are looking at how you break the problem down, the trade-offs you make, and how clearly you explain them. **Assumptions are welcome.** When something is ambiguous, pick a sensible option, move on, and note it in your README. **Searching, reading docs, and asking AI tools are all fine.** Copying a whole existing project is not.