#!/usr/bin/env bash
# Deploys the AWS infrastructure (CDK), then builds the site and uploads it.
# Uses your default AWS credentials; set AWS_PROFILE to use another profile.
# SKIP_INFRA=1 scripts/deploy.sh only rebuilds and uploads the site.
set -euo pipefail
cd "$(dirname "$0")/.."

OUTPUTS=infra/cdk-outputs.json

if [ "${SKIP_INFRA:-}" != "1" ]; then
  echo "==> Deploying infrastructure"
  (cd infra && pnpm exec cdk deploy --all --outputs-file cdk-outputs.json)
fi

output() { node -p "require('./$OUTPUTS').FrenchTouchSite.$1"; }

echo "==> Writing lib/aws-config.json"
node -e "
const o = require('./$OUTPUTS').FrenchTouchSite
const config = {
  region: o.Region,
  userPoolId: o.UserPoolId,
  userPoolClientId: o.UserPoolClientId,
  identityPoolId: o.IdentityPoolId,
  contentBucket: o.ContentBucketName,
  siteUrl: o.SiteUrl,
}
require('fs').writeFileSync('lib/aws-config.json', JSON.stringify(config, null, 2) + '\n')
"

if [ -z "${NEXT_PUBLIC_WEB3FORMS_KEY:-}" ] && ! grep -qs '^NEXT_PUBLIC_WEB3FORMS_KEY=..*' .env.local; then
  echo "warning: NEXT_PUBLIC_WEB3FORMS_KEY isn't set in .env.local, so the order form will show an error." >&2
fi

echo "==> Building site"
rm -rf out
pnpm build

SITE_BUCKET=$(output SiteBucketName)
echo "==> Uploading to s3://$SITE_BUCKET"
# Hashed build assets never change, so browsers may keep them forever; everything else revalidates.
aws s3 sync out/_next/static "s3://$SITE_BUCKET/_next/static" --cache-control "public, max-age=31536000, immutable"
aws s3 sync out "s3://$SITE_BUCKET" --delete --exclude "_next/static/*" --cache-control "public, max-age=0, must-revalidate"

echo "==> Clearing the CloudFront cache"
aws cloudfront create-invalidation --distribution-id "$(output DistributionId)" --paths "/*" --query Invalidation.Id --output text

echo "==> Live at $(output SiteUrl)"
