---
name: Link Workspace Packages
description: Dependency and install workflow guidance for monorepo package linking.
---

# Skill: Link Workspace Packages

This repository is a monorepo with separate Node projects. Treat each project as independently installable unless explicit workspace tooling is added.

## Use this skill when

- CI fails due to missing package metadata or lockfile drift.
- A change touches dependencies in more than one subproject.

## Expected behavior

- Keep dependency updates scoped to the impacted subproject.
- Run `npm ci` in each affected directory.
- Do not introduce new package managers unless explicitly requested.
