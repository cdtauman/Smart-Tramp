# Smart Tramp

A lightweight ride sharing prototype built with React and Supabase. Passengers can submit ride requests and drivers can create rides and match requests to their routes. Google Maps is used for geocoding and displaying ride paths.

## Development

1. Copy `.env.example` to `.env` and fill in your Supabase and Google Maps keys.
2. Install dependencies with `npm install` (requires internet access).
3. Start the dev server:

```bash
npm run dev
```

Type checking can be executed with:

```bash
npm run typecheck
```

The SQL schema used by Supabase is located in `supabase.sql`.