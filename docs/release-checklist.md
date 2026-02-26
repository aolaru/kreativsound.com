# Release Checklist

Run this before pushing a release commit.

## 1) Mobile quality pass (real phone)

- Open the site on a real phone.
- Check top hero spacing and button wrapping.
- Verify all interactive targets are easy to tap (>= 44px).
- Confirm product cards are readable and not cramped.
- Test theme switcher and email capture on mobile.

## 2) Lighthouse quick check

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

## 3) Final ship steps

- Update `changelog.md`.
- `git add . && git commit -m "..."`
- Push when ready.
