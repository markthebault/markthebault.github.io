---
title: 'Evals are CI for agents'
description: 'Treating evaluation as continuous integration — not a one-off benchmark — is the single highest-leverage practice for shipping agentic systems with confidence.'
pubDate: 2025-05-22
tags: ['evaluation', 'agentic-ai', 'engineering']
---

We don't ship backend code without tests. We don't merge without CI. Yet teams
routinely ship prompt changes — which can alter behaviour across every input —
on the strength of "looks good to me."

The fix isn't more careful eyeballing. It's borrowing the discipline we already
trust: continuous integration, applied to model behaviour.

## A change you can't measure is a change you can't make

The defining property of agentic systems is that a tiny edit can have
non-local effects. Reword a system prompt and you might fix one case while
silently breaking twenty. Without a regression suite, every change is a gamble,
and teams respond the way people always respond to risky changes: they stop
making them. The system ossifies.

An eval suite turns that gamble back into engineering.

## What a good eval suite looks like

- **Cases pulled from production.** The best eval cases are real failures you've
  already seen. Every incident becomes a permanent regression test.
- **Graded, not binary.** Many agent tasks aren't pass/fail. Use rubric-based
  grading — often with a model as judge — and track score distributions.
- **Fast enough to run on every PR.** If the suite takes an hour, it won't gate
  merges. Sample aggressively for the PR gate; run the full suite nightly.

## The cultural shift

The real change isn't technical, it's cultural. Once a team has evals wired into
CI, the conversation changes from "does this feel better?" to "this moved the
tool-selection score from 0.82 to 0.89, with no regressions." That's a
conversation engineers know how to have.

Build the harness early. It's the thing that lets you move fast *later*.
