---
title: 'Agents don’t need a framework. They need a platform.'
description: 'Why the hard part of agentic AI isn’t the agent loop — it’s the orchestration, evaluation, and infrastructure that make it dependable in production.'
pubDate: 2025-06-10
tags: ['agentic-ai', 'platform', 'architecture']
---

Every week a new agent framework promises to make building autonomous systems
trivial. Most of them deliver on the easy 20%: the loop that calls a model,
parses a tool call, and runs it. That part was never the problem.

The problem is everything the demo quietly skips.

## The demo-to-production gap

A demo agent runs once, on a happy path, with a human watching. A production
agent runs ten thousand times a day, unattended, against inputs nobody
anticipated. The gap between those two is not model quality — it's
infrastructure.

- **Determinism where it matters.** You can't debug a system you can't replay.
  Capture every prompt, tool call, and response as structured events.
- **Evaluation as a first-class system.** If you can't measure regressions, you
  can't ship changes with confidence. Evals are CI for agents.
- **Cost and latency budgets.** An agent that's correct but takes 40 seconds
  and three dollars per run is not correct in any way that matters.

## Treat the agent as the smallest part

The reliable systems I've worked on invert the usual emphasis. The agent loop is
maybe 10% of the code. The other 90% is the platform around it:

```
orchestration  → retries, timeouts, fan-out, human-in-the-loop
observability  → traces, token accounting, eval hooks
guardrails     → input validation, output contracts, kill switches
state          → durable execution, idempotency, replay
```

None of this is glamorous. All of it is what separates a system you trust from a
system you babysit.

## What to build first

If you're starting today, build the **trace and eval harness before the agent**.
It feels backwards — you have nothing to trace yet. But the moment you have an
agent, you'll want to know why it did something, and by then you're
retrofitting. Instrumentation added after the fact is always thinner than
instrumentation designed in.

The framework will change. The platform discipline won't.
