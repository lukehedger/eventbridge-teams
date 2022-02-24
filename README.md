# eventbridge-teams

Sending events from AWS EventBridge to MS Teams

## Deploy

```
STAGE=xxx TEAMS_WEBHOOK_URL=xxx npx cdk deploy
```

## Put Event

```
aws events put-events --entries file://event.json
```
