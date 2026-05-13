# Huzur Rewards Backend

This backend provides the shared leaderboard used by the mobile app.

## Environment

Set these on the hosting provider:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
REWARDS_ADMIN_TOKEN=choose_a_private_admin_token
```

The backend also accepts Vercel Marketplace's generated Upstash names:

```env
UPSTASH_REDIS_REST_KV_REST_API_URL=...
UPSTASH_REDIS_REST_KV_REST_API_TOKEN=...
```

Set this in the mobile app build environment:

```env
EXPO_PUBLIC_REWARDS_API_URL=https://huzur-six.vercel.app
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

`GET /rewards/config`

Returns the active monthly reward settings shown in the app.

`POST /rewards/config`

Requires `x-admin-token: REWARDS_ADMIN_TOKEN`. Use this to turn the campaign on/off and change the remote prize image without publishing a new app build.

```json
{
  "isActive": true,
  "minimumMonthlyPoints": 500,
  "prizes": [
    {
      "title": "Kur'an-ı Kerim",
      "description": "Ay birincisine hediye edilir.",
      "imageUrl": "https://example.com/kuran.jpg"
    },
    {
      "title": "Seccade",
      "description": "Ay ikincisine hediye edilir.",
      "imageUrl": "https://example.com/seccade.jpg"
    }
  ]
}
```

`POST /rewards/claim`

The monthly winner submits delivery details from the app. The backend checks that the user is currently first and has at least the configured minimum monthly points.

`GET /rewards/claims?token=REWARDS_ADMIN_TOKEN`

Returns the current month's submitted winner delivery details for the app owner.
