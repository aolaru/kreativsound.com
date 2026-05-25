# Preset Mutator

Preset Mutator is the Kreativ Sound browser app for creating Vital preset variants from scratch intent, existing `.vital` presets, or short audio sources.

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

## Licensing

Preset Mutator Pro uses signed per-customer license tokens. Generate a token from the repository root:

```bash
npm run license:preset-mutator -- --email customer@example.com --order ORDER-ID
```

The private signing key stays in `private/` and must not be committed or shared. The browser app only contains the public verification key.

## Editing Notes

- Keep mode routes stable: `/ui/`, `/ui/scratch/`, `/ui/mutate/`, and `/ui/audio/`.
- Keep shared generation logic in `public/ui/engine/` inside this app source tree.
- Keep seed `.vital` files in `public/assets/seeds/vital/raw/`.
- Avoid adding dependencies unless the app is formally split into its own package later.
