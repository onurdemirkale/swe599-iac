import * as cdk from 'aws-cdk-lib';

interface LambdaInterface {
  NAME: string;
  ARCHITECTURE: cdk.aws_lambda.Architecture;
  CODEBUILD_ON_COMMIT_BRANCHES: string[];
  MEMORY_SIZE: number;
  TYPE: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'AUTH')[];
}

export default LambdaInterface;
