---
title: 'Paved roads for AI teams'
description: 'Platform engineering’s best idea — the paved road — applies directly to AI. Here’s how to give teams a default path to production that’s the easy path too.'
pubDate: 2025-04-30
tags: ['platform', 'developer-experience', 'ai']
---

Platform engineering's most durable idea is the **paved road**: a supported,
opinionated path to production that's so much easier than the alternatives that
teams choose it freely. No mandates required — the road wins on ergonomics.

AI teams need paved roads more than anyone, because the alternative is every
team reinventing prompt management, evals, tracing, and deployment from scratch,
each subtly differently, none of it observable from the outside.

## What goes on the road

A paved road for AI work bundles the unglamorous essentials so a team doesn't
have to assemble them:

- **A project template** that ships with tracing, eval scaffolding, and a
  deploy pipeline already wired in.
- **Shared gateways** for model access — so rate limits, cost attribution, and
  fallbacks are solved once, centrally.
- **A standard eval harness** so every team's quality bar is legible to the
  org, not locked in someone's notebook.

## The road must be the easy path

This is the part teams get wrong. A paved road that's *more* work than rolling
your own isn't a road, it's a tollbooth. The discipline is relentless: the
supported path has to be the path of least resistance. If using the shared
gateway is harder than calling the API directly, engineers will call the API
directly, and they'll be right to.

## Measure adoption, not compliance

You'll know the road works when teams use it without being told to. Track
adoption as your real metric. If adoption is low, the answer is never a mandate
— it's that the road isn't good enough yet. Go fix the road.

Good platform work is invisible. The teams on your paved road should feel fast,
not governed.
