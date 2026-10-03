import { App } from 'aws-cdk-lib'
import { DnsStack } from '../lib/dns-stack'
import { SiteStack } from '../lib/site-stack'

const app = new App()
const account = process.env.CDK_DEFAULT_ACCOUNT
const domainName: string = app.node.getContext('domainName')
// Set "useDomain" to true in cdk.json once Namecheap uses the Route 53 name servers (see DEPLOY.md).
const useDomain = String(app.node.tryGetContext('useDomain')) === 'true'

const dns = new DnsStack(app, 'FrenchTouchDns', {
  // CloudFront only accepts certificates from us-east-1.
  env: { account, region: 'us-east-1' },
  crossRegionReferences: true,
  domainName,
  withCertificate: useDomain,
})

new SiteStack(app, 'FrenchTouchSite', {
  env: { account, region: 'us-west-2' },
  crossRegionReferences: true,
  domain: useDomain && dns.certificate ? { name: domainName, zone: dns.zone, certificate: dns.certificate } : undefined,
})
