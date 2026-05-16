# Release Checklist

Run this before pushing a release commit.

## 1) Mobile quality pass (real phone)

- Open the site on a real phone.
- Check top hero spacing and button wrapping.
- Verify all interactive targets are easy to tap (>= 44px).
- Confirm product cards are readable and not cramped.
- Test theme switcher and main navigation on mobile.

## 2) Product asset pass

- Generate new pack thumbnails with `bash scripts/generate-thumbnail.sh <source> public/assets/thumbs/<name>.jpg`.
- Confirm new product cards use the local thumbnail, not a temporary source file.
- Remove or ignore any intermediate images before commit.

## 3) Lighthouse quick check

From project root:

```bash
bash scripts/lighthouse-check.sh
```

Review report at:

- `reports/lighthouse/latest.report.html`

Suggested thresholds:

- Performance: >= 85
- Accessibility: >= 95
- Best Practices: >= 95
- SEO: >= 95

## 4) Monitoring check

- Confirm Cloudflare Web Analytics is receiving page traffic after deploy.
- Confirm uptime monitor is green for `https://kreativsound.com/`.

## 5) Final ship steps

- Update `changelog.md`.
- Run `bash scripts/release-gate.sh`.
- `git add . && git commit -m "..."`
- Push when ready.
