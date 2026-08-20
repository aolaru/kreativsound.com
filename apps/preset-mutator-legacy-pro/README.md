# Preset Mutator PRO

This unlisted app preserves the paid Preset Mutator PRO workflow for verified customers who purchased it before the public tool became free.

## Public URL

```text
/preset-mutator-pro/
```

The app is `noindex` and must not be linked from the public site, product catalog, or Gumroad sales page.

## Customer License Token

Generate a signed token after verifying the customer's Gumroad order:

```bash
npm run license:preset-mutator-legacy-pro -- --email customer@example.com --order ORDER-ID
```

The private signing key is stored under `private/` and is intentionally not committed. Send the resulting token directly to the customer along with the Preset Mutator PRO URL.

## Editing Notes

- Keep this app isolated from `apps/preset-mutator/public/`, which is the free public tool.
- Do not add checkout links to this legacy app.
- Keep the signed-token verification path until all eligible Preset Mutator PRO customers have been fulfilled.
