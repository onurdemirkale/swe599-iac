// CDK
import {Stack, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Constants
import {BACKEND} from '../constants/backendConstant';
import {LAMBDA, LAMBDA_LIST} from '../constants/lambdaConstant';

// Interfaces
import {BackendStackProps} from '../interfaces/BackendStackProps';

// Stacks
import LambdaStack from './lambdaStack';

export default class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Env variable checks
    if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
      throw new Error(
        'CDK - Undefined CDK credentials in environment variables.'
      );
    }

    // Authenticate to GitHub repository through codebuild using credentials stored in secrets manager
    new codebuild.GitHubSourceCredentials(
      this,
      BACKEND.CODEBUILD_CREDENTIALS_NAME,
      {
        accessToken: SecretValue.secretsManager(BACKEND.GITHUB_TOKEN_NAME, {
          jsonField: 'accessToken',
        }),
      }
    );

    // Create the security group for the Lambda functions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      LAMBDA.SECURITY_GROUP_NAME,
      {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: LAMBDA.SECURITY_GROUP_NAME,
      }
    );

    const lambdaStack = new LambdaStack(this, 'lambdaStack', {null: null});
    lambdaStack.createLambdaFunction();
    lambdaStack.createLambdaPipeline();
  }
}
