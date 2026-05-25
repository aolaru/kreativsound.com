# Preset Mutator Release Notes

## Current Internal Layout

- Source: `apps/preset-mutator/public/`
- Generated deploy copy: `public/apps/preset-mutator/`
- Public app URL: `/apps/preset-mutator/ui/`
- App QA: `npm run check:preset-mutator`
- Full site QA: `npm run check`

## Release Checklist

1. Edit app source under `apps/preset-mutator/public/`.
2. Run `npm run check:preset-mutator`.
3. Run `npm run check`.
4. Test `/apps/preset-mutator/ui/`, `/ui/mutate/`, and `/ui/audio/` locally.
5. Commit source changes, not generated `public/apps/preset-mutator/` output.

## Split Criteria

Consider moving Preset Mutator into its own repository when it needs an independent release cycle, a backend service, standalone deployment, or a separate package/build system.
