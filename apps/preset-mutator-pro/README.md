# Preset Mutator Pro

This unlisted app provides the paid Preset Mutator Pro workflow for verified customers.

## Public URL

```text
/preset-mutator-pro/
```

The app is `noindex`. Customers open it at this URL after purchasing and receiving their activation token.

## Customer License Token

Generate a signed token after verifying the customer's Gumroad order:

```bash
npm run license:preset-mutator-pro -- --email customer@example.com --order ORDER-ID
```

The private signing key is stored under `private/` and is intentionally not committed. Send the resulting token directly to the customer along with the Preset Mutator Pro URL.

## Editing Notes

- Keep this app isolated from `apps/preset-mutator/public/`, which is the free public tool.
- Do not add checkout links to this customer app.
- Keep the signed-token verification path for all Preset Mutator Pro customers.

## Versioning

The repository pre-commit hook bumps the Pro patch version when staged changes include `apps/preset-mutator-pro/public/`. It updates all three Pro mode labels in the same commit. A deliberately staged version change is preserved, so release notes can set the version explicitly before commit.
