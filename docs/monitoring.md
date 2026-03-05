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

The site sends a `404_view` analytics event on the 404 page.

Use your analytics dashboard to monitor:

- 404 count by URL path
- Referrer sources causing broken links

## Conversion Monitoring

Track these events in analytics:

- `featured_product_click`
- `product_card_click`
- `hero_explore_click`
- `hero_patreon_click`
- `email_signup_success`
- `email_signup_failure`

Review weekly and prioritize:

- Highest-click products
- Email signup success rate
- Broken funnel pages with high exits
