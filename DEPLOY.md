# Deploying French Touch Bakery

The site is a static Next.js export on S3 + CloudFront (us-west-2). Agathe edits the menu, events and gallery at `/admin`. She signs in with Cognito, and her browser saves directly to a separate, versioned content bucket: `data/site.json` holds the text, and `uploads/` holds the photos. No servers, no database. The order form emails her through Web3Forms.

```
infra/       CDK app: FrenchTouchDns (Route 53 zone + certificate, us-east-1) and FrenchTouchSite (everything else)
scripts/     deploy.sh, invite-admin.sh
lib/aws-config.json   written by deploy.sh from the stack outputs; safe to commit (nothing secret)
```

## One-time setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WEB3FORMS_KEY`. Agathe creates the key at web3forms.com with the Gmail address that should receive orders.
3. Bootstrap CDK in both regions:
   ```sh
   ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
   (cd infra && pnpm exec cdk bootstrap aws://$ACCOUNT/us-east-1 aws://$ACCOUNT/us-west-2)
   ```

## First deploy (before the domain is set up)

```sh
scripts/deploy.sh
```

CDK asks you to approve the IAM changes. When the deploy finishes, the site is live at the `https://dxxxx.cloudfront.net` address it prints.

Then create the admin logins. Invite yourself first and test the full flow: first login, adding a photo, editing an event.

```sh
scripts/invite-admin.sh you@example.com
scripts/invite-admin.sh frenchtouch.bakery@gmail.com
```

The invitation comes from `no-reply@verificationemail.com` and may land in spam. The temporary password lasts 7 days. To send a fresh one, use `RESEND=1 scripts/invite-admin.sh <email>`.

## Connecting frenchtouch-bakery.com (Namecheap)

1. Copy the four name servers from the `FrenchTouchDns.NameServers` output (also saved in `infra/cdk-outputs.json`).
2. In Namecheap, go to Domain List > Manage > Nameservers and choose **Custom DNS**. Enter the four name servers.
3. Wait until `dig NS frenchtouch-bakery.com +short` shows the AWS name servers. This usually takes minutes, but can take a few hours.
4. Set `"useDomain": true` in `infra/cdk.json` and run `scripts/deploy.sh`. CDK issues the certificate, attaches both `frenchtouch-bakery.com` and `www.` (which redirects) to CloudFront, and rewrites the admin invitation email to use the new address.

Agathe's email stays on Gmail, so no MX records are needed.

## Everyday tasks

- **Code or design changes:** `SKIP_INFRA=1 scripts/deploy.sh` rebuilds and uploads the site only. Agathe's content isn't touched, because it lives in the content bucket.
- **Restore content after a mistake:** S3 console > content bucket > `data/site.json` > Versions. Download the version you want, then upload it back to the same key. Earlier versions are kept for 90 days.
- **Agathe forgot her password:** she can use "Forgot your password?" on the sign-in page.
- **Local development:** `pnpm dev`. After the first deploy, `/data` and `/uploads` are proxied to the live site, so you see real content. Signing in locally edits the live content.

## Costs

Route 53 costs $0.50/month for the hosted zone. S3, CloudFront and Cognito come to cents at this traffic, and Web3Forms is free up to 250 submissions/month. Consider setting an AWS Budget alert at a few dollars.

## If something breaks

- **Order form shows an error:** check `NEXT_PUBLIC_WEB3FORMS_KEY` in `.env.local`, then redeploy. The key is built into the site.
- **Admin says "Couldn't save":** her session may have expired; reload and sign in again. Persistent failures show the cause in the browser console.
- **Something blocked in the browser console (CSP):** the Content-Security-Policy is defined in `infra/lib/site-stack.ts`. Any new third-party script, font or API needs adding there.
