---
name: Twilio on Cloudflare Edge
description: Why Twilio SMS calls in Edge Runtime routes must use the REST API instead of the Node SDK.
---

Cloudflare Edge Runtime routes must call Twilio's REST API with the Web `fetch` API rather than importing the `twilio` Node.js SDK.

**Why:** The Twilio SDK depends on Node built-ins such as `net`, `tls`, and `crypto`, which are unavailable in the Edge Runtime and cause the production build to fail.

**How to apply:** For any Twilio operation inside a route exported with `runtime = 'edge'`, use an authenticated HTTPS request and Edge-compatible Web APIs. Do not reintroduce the Twilio Node SDK unless that route returns to the Node.js runtime.