# Preset Mutator Lite

Preset Mutator Lite is a free Kreativ Sound browser app for creating three Vital preset variants from scratch intent, existing `.vital` presets, or short audio sources.

## Source And Public URL

Source of truth:

```text
apps/preset-mutator/public/
```

Public URL after sync/build:

```text
/preset-mutator/
```

The root `predev` and `prebuild` scripts copy this app into `public/preset-mutator/`. Treat that public copy as generated output. The old `/apps/preset-mutator/ui/` path is generated as a redirect.

## Local Development

From the repository root:

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:4321/preset-mutator/
```

## QA

Run the app-specific static and engine checks:

```bash
npm run check:preset-mutator
```

Run the full site check before publishing:

```bash
npm run check
```

## Versioning

Lite versions are updated deliberately for Lite releases. The repository hook updates the Preset Mutator Lite version when its source changes.

Install the hook after cloning:

```bash
npm run setup:git-hooks
```

## Workflow

Each mode generates three exportable `.vital` variants. The app runs locally in the browser, with no account, checkout, or license token required.

## Editing Notes

- Keep mode routes stable: `/ui/`, `/ui/scratch/`, `/ui/mutate/`, and `/ui/audio/`.
- Keep shared generation logic in `public/ui/engine/` inside this app source tree.
- Keep seed `.vital` files in `public/assets/seeds/vital/raw/`.
- Avoid adding dependencies unless the app is formally split into its own package later.
