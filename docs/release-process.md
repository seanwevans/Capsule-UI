# Release Process

This repository uses [Changesets](https://github.com/changesets/changesets) to manage semantic versions and generate changelogs.

## Adding a change

1. Run `pnpm changeset`.
2. Choose the packages affected and the type of change (major, minor or patch).
3. Commit the generated file inside the `.changeset/` folder alongside your code changes.

## Automated releases

Merging to `main` or any `release/*` branch triggers a GitHub Action that:

- installs dependencies
- runs the full lint and test suite
- versions packages and updates changelogs based on the collected changesets
- publishes updated packages to npm using `NPM_TOKEN`

Changelogs and Git tags are created automatically. No manual version bumping is required.
