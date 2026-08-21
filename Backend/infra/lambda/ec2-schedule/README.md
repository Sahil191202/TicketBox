# Day 10 — EC2 schedule Lambda (auto-stop / auto-start)

Stops the TicketBox EC2 at night and starts it in the morning so the Elastic IP keeps DNS stable without paying for idle compute.

## What to create in AWS (console or CLI)

1. **IAM role** for Lambda (`ticketbox-ec2-scheduler-role`)
   - Trust: `lambda.amazonaws.com`
   - Permissions:
     - `ec2:StartInstances`, `ec2:StopInstances`, `ec2:DescribeInstances` on your instance ARN
     - `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`
2. **Lambda function**
   - Runtime: Python 3.12
   - Handler: `handler.handler`
   - Upload `handler.py` (zip single file or use inline editor)
   - Env:
     - `INSTANCE_IDS=i-xxxxxxxx`
     - `AWS_REGION=ap-south-1` (optional; runtime sets region)
   - Timeout: 30s · Memory: 128 MB
3. **EventBridge rules** (two rules → same function, different constant JSON input)

| Name | Schedule (UTC examples) | Input |
|---|---|---|
| `ticketbox-ec2-stop` | `cron(30 17 * * ? *)` ≈ 11:00 PM IST | `{"action":"stop"}` |
| `ticketbox-ec2-start` | `cron(30 2 * * ? *)` ≈ 8:00 AM IST | `{"action":"start"}` |

Convert IST → UTC carefully for your course window.

4. **Test**
   - Lambda → Test with `{"action":"stop"}` then `{"action":"start"}`
   - Confirm Elastic IP still associated after stop
   - After start: SSH + `pm2 status` + `curl -sI https://yourdomain.com`

## Zip from laptop (optional)

```bash
cd Backend/infra/lambda/ec2-schedule
zip function.zip handler.py
# Upload function.zip in Lambda console
```

## Notes

- Do **not** terminate the instance from Lambda — only stop/start.
- Keep the Elastic IP association; re-associating after every start is painful.
- If PM2 does not come back after start, enable `pm2 startup` + `pm2 save` (Day 7).
