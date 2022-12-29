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

    const apiGateway = new ApiGatewayStack(
      this,
      API_GATEWAY.apiGatewayName,
      API_GATEWAY
    );

    const api = apiGateway.createApi();

    // Initially, iterate over Lambda Functions and create API Gateway Root
    // Resources that may be used by multiple Lambda Functions.
    const rootResourceMap = new Map<string, apigateway.Resource>();

    for (const LAMBDA of LAMBDA_LIST) {
      if (!rootResourceMap.has(LAMBDA.apiGatewayRootPath)) {
        const apiGatewayRootResource = apiGateway.createRootResource(
          api,
          LAMBDA.apiGatewayRootPath
        );

        rootResourceMap.set(LAMBDA.apiGatewayRootPath, apiGatewayRootResource);
      }
    }
    for (const LAMBDA of LAMBDA_LIST) {
      const lambdaStack = new LambdaStack(
        this,
        `${LAMBDA.lambdaFunctionName}Stack`,
        {
          lambdaFunctionName: LAMBDA.lambdaFunctionName,
          lambdaArchiteture: LAMBDA.lambdaArchiteture,
          lambdaMemorySize: LAMBDA.lambdaMemorySize,
          httpMethod: LAMBDA.httpMethod,
          apiGatewayResourcePath: LAMBDA.apiGatewayResourcePath,
          apiGatewayRootPath: LAMBDA.apiGatewayRootPath,
          sourceCodeRepositoryBranch: LAMBDA.sourceCodeRepositoryBranch,
          sourceCodeRepositoryOwner: LAMBDA.sourceCodeRepositoryOwner,
          sourceCodeRepositoryName: LAMBDA.sourceCodeRepositoryName,
          githubTokenSecretName: LAMBDA.githubTokenSecretName,
          githubTokenSecretField: LAMBDA.githubTokenSecretField,
        }
      );

      lambdaStack.createLambdaFunction();
      lambdaStack.createLambdaPipeline();
    }
  }
}
