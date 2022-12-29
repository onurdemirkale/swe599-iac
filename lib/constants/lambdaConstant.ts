import {LambdaStackProps} from '../interfaces/LambdaStackProps';
import {aws_lambda} from 'aws-cdk-lib';

const LAMBDA_LIST: LambdaStackProps[] = [
  {
    lambdaFunctionName: 'login',
    lambdaArchiteture: aws_lambda.Architecture.ARM_64,
    lambdaMemorySize: 256,
    httpMethod: 'POST',
    apiGatewayRootPath: 'login',
    apiGatewayResourcePath: null,
    sourceCodeRepositoryBranch: 'main',
    sourceCodeRepositoryOwner: 'onurdemirkale',
    sourceCodeRepositoryName: 'swe599-backend',
    githubTokenSecretName: 'github-auth-token',
    githubTokenSecretField: 'accessToken',
  },
  {
    lambdaFunctionName: 'addItem',
    lambdaArchiteture: aws_lambda.Architecture.ARM_64,
    lambdaMemorySize: 256,
    httpMethod: 'POST',
    apiGatewayRootPath: 'items',
    apiGatewayResourcePath: 'addItem',
    sourceCodeRepositoryBranch: 'main',
    sourceCodeRepositoryOwner: 'onurdemirkale',
    sourceCodeRepositoryName: 'swe599-backend',
    githubTokenSecretName: 'github-auth-token',
    githubTokenSecretField: 'accessToken',
  },
  {
    lambdaFunctionName: 'removeItem',
    lambdaArchiteture: aws_lambda.Architecture.ARM_64,
    lambdaMemorySize: 256,
    httpMethod: 'DELETE',
    apiGatewayRootPath: 'items',
    apiGatewayResourcePath: 'removeItem',
    sourceCodeRepositoryBranch: 'main',
    sourceCodeRepositoryOwner: 'onurdemirkale',
    sourceCodeRepositoryName: 'swe599-backend',
    githubTokenSecretName: 'github-auth-token',
    githubTokenSecretField: 'accessToken',
  },
];

const LAMBDA = {
  SECURITY_GROUP_NAME: 'swe599-lambda-sg',
};

export {LAMBDA, LAMBDA_LIST};
