# Claude proxy worker

Holds the Anthropic API key so it never ships in the app bundle.

## Deploy

```bash
cd worker
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY     # paste the key when prompted
npx wrangler deploy
```

Wrangler prints a URL like `https://gcse-hq-claude.<subdomain>.workers.dev`.
Paste that into the app under **Settings → AI → Proxy URL**, and set the mode to
**Proxy**.

## Before going live

Edit `ALLOWED_ORIGIN` in `wrangler.toml` to the real app origin and redeploy.
Without it the endpoint will answer requests from any site, which means anyone
who finds the URL can spend your API credit.

Optionally also:

```bash
npx wrangler secret put SHARED_SECRET
```

and set the same value in the app. The worker then rejects requests that do not
carry it.

## Cost control

The worker caps `max_tokens` at 2048 and trims history to the last 20 messages.
The app additionally counts requests against a monthly cap set in Settings, and
shows a running cost estimate. Between the two, the £5/month target holds even if
something misbehaves.
