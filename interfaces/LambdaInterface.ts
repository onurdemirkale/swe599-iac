import * as cdk from 'aws-cdk-lib';

interface LambdaInterface {
  LAMBDA_NAME: string;
  LAMBDA_ARCHITECTURE: cdk.aws_lambda.Architecture;
  CODEBUILD_ON_COMMIT_BRANCHES: string[];
  MEMORY_SIZE: number;
  TYPE: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'AUTH')[];
}

export default LambdaInterface;
