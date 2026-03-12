# Monitoring

## Uptime

Set up one uptime monitor for:

- `https://kreativsound.com/`

Recommended providers:

- UptimeRobot (free tier available)
- Better Stack Uptime

Suggested check config:

- Interval: 5 minutes
- Method: `GET`
- Alerts: email + push

## 404 Tracking

Use Cloudflare Web Analytics for page-level traffic monitoring.

For 404 review, monitor:

- Requests to `/404.html`
- Referrer sources causing broken links

## Conversion Monitoring

Cloudflare Web Analytics does not provide the same custom event model as Plausible.

Review weekly and prioritize:

- Top-traffic pages
- Traffic trends by referrer
- Broken funnel pages with high exits
