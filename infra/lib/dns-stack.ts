import { CfnOutput, Fn, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import type { Construct } from 'constructs'

type DnsStackProps = StackProps & {
  domainName: string
  withCertificate: boolean
}

// The domain is registered at Namecheap but its DNS is hosted in Route 53, so the HTTPS certificate
// validates and renews itself and the site records are managed here.
export class DnsStack extends Stack {
  readonly zone: route53.IHostedZone
  readonly certificate?: acm.ICertificate

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props)

    const zone = new route53.PublicHostedZone(this, 'Zone', { zoneName: props.domainName })
    // Recreating the zone would change its name servers and take the site offline until Namecheap is updated.
    zone.applyRemovalPolicy(RemovalPolicy.RETAIN)
    this.zone = zone

    new CfnOutput(this, 'NameServers', {
      value: Fn.join(' ', zone.hostedZoneNameServers ?? []),
      description: 'Enter these under Namecheap > Domain > Nameservers > Custom DNS',
    })

    // Validation only succeeds once Namecheap points at the name servers above, hence the useDomain switch.
    if (props.withCertificate) {
      this.certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.domainName,
        subjectAlternativeNames: [`www.${props.domainName}`],
        validation: acm.CertificateValidation.fromDns(zone),
      })
    }
  }
}
