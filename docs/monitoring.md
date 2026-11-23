# Monitoring

## Uptime

The steps below are recommendations, not confirmation that monitoring is currently configured. Verify the active provider and alert recipients in its dashboard.

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

Use the configured analytics dashboards for traffic trends. Analytics is optional, so reports exclude visitors who decline consent; use hosting or CDN request logs where available for a more complete view.

For 404 review, monitor:

- Requests to `/404.html`
- Referrer sources causing broken links

## Conversion Monitoring

Review consented Google Analytics events alongside Cloudflare page-level traffic.

Review weekly and prioritize:

- Top-traffic pages
- Traffic trends by referrer
- Broken funnel pages with high exits
