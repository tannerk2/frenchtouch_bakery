#!/usr/bin/env bash
# Creates an admin login and emails it a temporary password (valid 7 days).
#   scripts/invite-admin.sh someone@example.com
#   RESEND=1 scripts/invite-admin.sh someone@example.com   # send a fresh temporary password
set -euo pipefail
cd "$(dirname "$0")/.."

EMAIL=${1:?Usage: scripts/invite-admin.sh email@example.com}
POOL_ID=$(node -p "require('./infra/cdk-outputs.json').FrenchTouchSite.UserPoolId")
REGION=$(node -p "require('./infra/cdk-outputs.json').FrenchTouchSite.Region")

aws cognito-idp admin-create-user \
  --region "$REGION" \
  --user-pool-id "$POOL_ID" \
  --username "$EMAIL" \
  --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
  --desired-delivery-mediums EMAIL \
  ${RESEND:+--message-action RESEND} \
  --query User.UserStatus --output text

echo "Invitation emailed to $EMAIL (from no-reply@verificationemail.com; check spam)."
