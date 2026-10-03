import path from 'node:path'
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import type * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'

type SiteStackProps = StackProps & {
  domain?: { name: string; zone: route53.IHostedZone; certificate: acm.ICertificate }
}

// Static site on S3 + CloudFront, plus a serverless admin: Cognito sign-in hands the browser temporary
// AWS credentials that can only write the site content file and photo uploads.
export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props)
    const { domain } = props

    // The built website. scripts/deploy.sh syncs `out/` here with --delete on every deploy.
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    })

    // Agathe's content (data/site.json and uploads/). A separate bucket, so a site deploy can never touch it.
    // Versioning keeps every earlier save for 90 days in case something needs restoring.
    const contentBucket = new s3.Bucket(this, 'ContentBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [{ noncurrentVersionExpiration: Duration.days(90), expiredObjectDeleteMarker: true }],
      // The admin page writes straight from the browser. Writes still need signed admin credentials.
      cors: [
        {
          allowedOrigins: ['http://localhost:3000', 'https://*.cloudfront.net', ...(domain ? [`https://${domain.name}`] : [])],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag', 'x-amz-request-id', 'x-amz-id-2', 'x-amz-server-side-encryption', 'x-amz-version-id'],
          maxAge: 3000,
        },
      ],
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const csp = [
      "default-src 'self'",
      // The static export inlines Next.js bootstrap scripts and styles, so nonces aren't an option.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      [
        "connect-src 'self'",
        'https://api.web3forms.com',
        `https://cognito-idp.${this.region}.amazonaws.com`,
        `https://cognito-identity.${this.region}.amazonaws.com`,
        `https://${contentBucket.bucketRegionalDomainName}`,
      ].join(' '),
      "form-action 'self' https://api.web3forms.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; ')

    const securityHeaders = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: csp, override: true },
        strictTransportSecurity: { accessControlMaxAge: Duration.days(365), includeSubdomains: true, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
      },
    })

    const urlRewrite = new cloudfront.Function(this, 'UrlRewrite', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromFile({ filePath: path.join(__dirname, '../functions/url-rewrite.js') }),
    })

    const contentOrigin = origins.S3BucketOrigin.withOriginAccessControl(contentBucket)
    const contentBehavior = (cachePolicy: cloudfront.ICachePolicy): cloudfront.BehaviorOptions => ({
      origin: contentOrigin,
      cachePolicy,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: securityHeaders,
      compress: true,
    })

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'French Touch Bakery',
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeaders,
        functionAssociations: [{ function: urlRewrite, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
        compress: true,
      },
      additionalBehaviors: {
        // Never cached, so a save shows up on the very next page load.
        '/data/*': contentBehavior(cloudfront.CachePolicy.CACHING_DISABLED),
        // Every upload gets a new random file name, so long caching is safe.
        '/uploads/*': contentBehavior(cloudfront.CachePolicy.CACHING_OPTIMIZED),
      },
      // S3 answers 403 for missing files because CloudFront isn't allowed to list the buckets.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.minutes(1),
      })),
      ...(domain ? { domainNames: [domain.name, `www.${domain.name}`], certificate: domain.certificate } : {}),
    })

    if (domain) {
      const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
      for (const [key, recordName] of [['Apex', domain.name], ['Www', `www.${domain.name}`]]) {
        new route53.ARecord(this, `${key}A`, { zone: domain.zone, recordName, target })
        new route53.AaaaRecord(this, `${key}Aaaa`, { zone: domain.zone, recordName, target })
      }
    }

    const siteUrl = domain ? `https://${domain.name}` : `https://${distribution.distributionDomainName}`

    const userPool = new cognito.UserPool(this, 'AdminUsers', {
      // Only people invited with scripts/invite-admin.sh can sign in.
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      featurePlan: cognito.FeaturePlan.LITE,
      passwordPolicy: {
        minLength: 10,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
        tempPasswordValidity: Duration.days(7),
      },
      userInvitation: {
        emailSubject: 'Your French Touch Bakery website login',
        emailBody: [
          `Bonjour! You can now update the French Touch Bakery menu, events and gallery at ${siteUrl}/admin`,
          'Email: {username}<br>Temporary password: {####}',
          'You will choose your own password the first time you sign in. This temporary password expires in 7 days.',
        ].join('<br><br>'),
      },
      // Also used for the "Forgot your password?" code.
      userVerification: {
        emailSubject: 'Your French Touch Bakery verification code',
        emailBody: 'Your French Touch Bakery verification code is {####}',
      },
      deletionProtection: true,
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const client = userPool.addClient('AdminWebClient', {
      authFlows: { userSrp: true },
      disableOAuth: true,
      preventUserExistenceErrors: true,
      refreshTokenValidity: Duration.days(30),
    })

    const identityPool = new cognito.CfnIdentityPool(this, 'AdminIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{ clientId: client.userPoolClientId, providerName: userPool.userPoolProviderName }],
    })

    const adminRole = new iam.Role(this, 'AdminRole', {
      description: 'Signed-in French Touch Bakery admins: write site content and photos',
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    })
    adminRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [contentBucket.arnForObjects('data/site.json'), contentBucket.arnForObjects('uploads/*')],
      }),
    )
    adminRole.addToPolicy(
      new iam.PolicyStatement({ actions: ['s3:DeleteObject'], resources: [contentBucket.arnForObjects('uploads/*')] }),
    )

    new cognito.CfnIdentityPoolRoleAttachment(this, 'AdminIdentityPoolRoles', {
      identityPoolId: identityPool.ref,
      roles: { authenticated: adminRole.roleArn },
    })

    // scripts/deploy.sh reads these into lib/aws-config.json.
    new CfnOutput(this, 'Region', { value: this.region })
    new CfnOutput(this, 'SiteUrl', { value: siteUrl })
    new CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName })
    new CfnOutput(this, 'ContentBucketName', { value: contentBucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId })
    new CfnOutput(this, 'UserPoolClientId', { value: client.userPoolClientId })
    new CfnOutput(this, 'IdentityPoolId', { value: identityPool.ref })
  }
}
