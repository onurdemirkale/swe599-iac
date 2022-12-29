import {aws_lambda} from 'aws-cdk-lib';
import {StackProps} from 'aws-cdk-lib';

interface LambdaStackProps extends StackProps {
  lambdaFunctionName: string;
  lambdaArchiteture: aws_lambda.Architecture;
  lambdaMemorySize: number;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'AUTH';
  apiGatewayRootPath: string;
  apiGatewayResourcePath: string | null;
  sourceCodeRepositoryName: string;
  sourceCodeRepositoryOwner: string;
  sourceCodeRepositoryBranch: string;
  githubTokenSecretName: string;
  githubTokenSecretField: string;
}

export {LambdaStackProps};
