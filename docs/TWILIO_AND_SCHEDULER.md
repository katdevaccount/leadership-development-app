# Twilio and Weekly Nudge Scheduler

## Environment variables (Twilio)

Set these in your deployment (e.g. Railway) and in local `.env` for SMS to work:

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | From [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | From Twilio Console |
| `TWILIO_PHONE_NUMBER` | "From" phone number for SMS (E.164) | `+1234567890` |

Manual nudges (coach sends from the app) and weekly nudges (scheduled) both use these credentials to send SMS via Twilio.

## Weekly nudges: scheduler

The app sends weekly nudges when the **POST /api/weekly-nudges/send** endpoint is called. You must trigger it on a schedule (e.g. once per week).

### Authentication

Call the endpoint with:

```
Authorization: Bearer <N8N_API_SECRET>
```

Use the same `N8N_API_SECRET` value you set in your deployment environment. If it is not set, the endpoint returns 500.

### How to trigger

1. **Railway cron**  
   If your host supports cron, add a job that runs at the desired time (e.g. every Monday 9:00) and performs:
   ```bash
   curl -X POST https://<your-app-host>/api/weekly-nudges/send \
     -H "Authorization: Bearer $N8N_API_SECRET"
   ```
   Use a Railway (or platform) secret for `N8N_API_SECRET` so it is not in the script.

2. **n8n (or similar)**  
   Create a workflow with a Schedule trigger (e.g. weekly) and an HTTP Request node:
   - Method: POST  
   - URL: `https://<your-app-host>/api/weekly-nudges/send`  
   - Authentication: None (send header manually)  
   - Header: `Authorization: Bearer <N8N_API_SECRET>`  

No other n8n logic is required; the app fetches the client list, builds the message per client, sends via Twilio, and logs to `nudges_sent`.

### Response

The endpoint returns JSON with:

- `sent_count`: number of clients who received an SMS
- `failed_count`: number of clients for whom sending failed
- `results`: array of `{ client_id, success, sid? | error? }`
- `generated_at`: ISO timestamp

Use this to monitor or alert on `failed_count > 0` if desired.
