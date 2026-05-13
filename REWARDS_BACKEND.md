# Huzur Rewards Backend

This backend provides the shared leaderboard used by the mobile app.

## Environment

Set these on the hosting provider:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

The backend also accepts Vercel Marketplace's generated Upstash names:

```env
UPSTASH_REDIS_REST_KV_REST_API_URL=...
UPSTASH_REDIS_REST_KV_REST_API_TOKEN=...
```

Set this in the mobile app build environment:

```env
EXPO_PUBLIC_REWARDS_API_URL=https://your-api-domain.vercel.app
```

## Endpoints

`POST /rewards/sync`

```json
{
  "userCode": "HZR-12345",
  "totalPoints": 42,
  "weeklyPoints": 12,
  "monthlyPoints": 30,
  "weekKey": "2026-W20",
  "monthKey": "2026-05"
}
```

`GET /leaderboard?period=weekly`

Supported periods: `weekly`, `monthly`, `all`.

```json
{
  "ok": true,
  "period": "weekly",
  "items": [
    { "code": "HZR-12345", "points": 42, "rank": 1 }
  ]
}
```
