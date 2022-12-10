// CDK
import {Stack, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Constants
import {BACKEND} from '../../constants/backendConstant';
import {LAMBDA, LAMBDA_LIST} from '../../constants/lambdaConstant';

// Interfaces
import BackendStackProps from '../../interfaces/BackendStackProps';

// Types
import LambdaArnList from '../../types/LambdaArnList';

// Functions
import LambdaFunction from './lambdaFunction';

export default class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Initialize the list which will map the Lambda names to created Lambda ARNs
    let lambdaArnList: LambdaArnList;

    // Authenticate to GitHub repository through codebuild using credentials stored in secrets manager
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const codebuildCredentials = new codebuild.GitHubSourceCredentials(
      this,
      BACKEND.CODEBUILD_CREDENTIALS_NAME,
      {
        accessToken: SecretValue.secretsManager(BACKEND.GITHUB_TOKEN_NAME, {
          jsonField: 'accessToken',
        }),
      }
    );

    // Create the security for the Lambda functions
    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      LAMBDA.SECURITY_GROUP_NAME,
      {
        vpc: props.vpc,
        allowAllOutbound: true,
        description: LAMBDA.SECURITY_GROUP_NAME,
      }
    );

    // Iterate over and create the defined Lambda functions
    LAMBDA_LIST.forEach(LAMBDA_FUNCTION => {
      const lambdaArn = LambdaFunction(
        props.vpc,
        LAMBDA_FUNCTION.NAME,
        LAMBDA_FUNCTION.ARCHITECTURE,
        LAMBDA_FUNCTION.CODEBUILD_ON_COMMIT_BRANCHES,
        LAMBDA_FUNCTION.MEMORY_SIZE,
        lambdaSecurityGroup
      );

      lambdaArnList[LAMBDA_FUNCTION.NAME] = lambdaArn;
    });
  }
}
