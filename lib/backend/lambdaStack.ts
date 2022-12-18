// CDK
import {Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';

// Constants

// Interfaces
import LambdaStackProps from '../interfaces/BackendStackProps';

export default class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Environment variable checks
    if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
      throw new Error(
        'CDK credentials are not defined the environment variables!'
      );
    }
  }
}
