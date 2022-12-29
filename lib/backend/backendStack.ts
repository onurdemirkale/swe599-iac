// CDK
import {Stack, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Constants
import {BACKEND} from '../constants/backendConstant';
import {LAMBDA, LAMBDAS} from '../constants/lambdaConstant';
import {API_GATEWAY} from '../constants/apiGatewayConstant';

// Interfaces
import {BackendStackProps} from '../interfaces/BackendStackProps';

// Stacks
import LambdaStack from './lambdaStack';
import ApiGatewayStack from './apiGatewayStack';
import PostgresRdsStack from './postgresRdsStack';

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

    for (const LAMBDA of LAMBDAS) {
      if (!rootResourceMap.has(LAMBDA.apiGatewayRootPath)) {
        const apiGatewayRootResource = apiGateway.createRootResource(
          api,
          LAMBDA.apiGatewayRootPath
        );

        rootResourceMap.set(LAMBDA.apiGatewayRootPath, apiGatewayRootResource);
      }
    }

    // Itereate over the Lambda functions and create the Lambda functions
    // and their respective pipelines. Then create API Gateway Resources
    // and integrate Lambda Functions.
    for (const LAMBDA of LAMBDAS) {
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

      // Obtain the previously created root path.
      const apiGatewayRootResource = rootResourceMap.get(
        LAMBDA.apiGatewayRootPath
      );

      // If API Gateway Root Resource is the only Resource, integrate
      // the Lambda into the Root Resource.
      if (LAMBDA.apiGatewayRootPath && !LAMBDA.apiGatewayResourcePath) {
        if (apiGatewayRootResource) {
          apiGateway.addLambda(
            lambdaStack.lambdaFunction,
            apiGatewayRootResource,
            LAMBDA.httpMethod
          );
        }
      }

      // If API Gateway Root Resource is not the only Resource, integrate
      // the Lambda into the given API Gateway Resource.
      if (LAMBDA.apiGatewayResourcePath) {
        const apiGatewayResource = apiGatewayRootResource?.addResource(
          LAMBDA.apiGatewayResourcePath
        );

        if (apiGatewayResource) {
          apiGateway.addLambda(
            lambdaStack.lambdaFunction,
            apiGatewayResource,
            LAMBDA.httpMethod
          );
        }
      }
    }
  }
}
