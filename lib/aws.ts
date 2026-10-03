import { Amplify } from 'aws-amplify'
import config from './aws-config.json'

// aws-config.json is written by scripts/deploy.sh from the CDK stack outputs; it is empty until the
// first deploy. None of these values are secret: they ship to every browser that opens /admin.
export const awsConfigured = Object.values(config).every(Boolean)

if (awsConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        identityPoolId: config.identityPoolId,
        loginWith: { email: true },
      },
    },
    Storage: { S3: { bucket: config.contentBucket, region: config.region } },
  })
}
