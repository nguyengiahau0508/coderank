---
name: Monitor CI
description: Playbook for diagnosing CI failures and proposing minimal safe fixes.
---

# Skill: Monitor CI

Track CI status and produce actionable summaries.

## Steps

1. Identify the first failing step.
2. Capture concise failing logs.
3. Determine whether issue is code, config, or environment.
4. Recommend smallest safe fix with verification commands.

## Output format

- Failing workflow/job/step
- Root cause
- Fix proposal
- Verification commands
