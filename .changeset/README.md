# Changesets

This directory is used by [Changesets](https://github.com/changesets/changesets) to track release notes and version bumps.

Each pull request that modifies published packages should include a changeset file created with:

```
pnpm changeset
```

Select the packages affected and the type of change (major, minor, or patch). Changeset files are stored in this folder and are consumed by the automated release workflow.
