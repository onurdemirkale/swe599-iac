import LambdaInterface from '../interfaces/LambdaInterface';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const LAMBDA_LIST: LambdaInterface[] = [
  {
    NAME: 'test',
    ARCHITECTURE: lambda.Architecture.ARM_64,
    CODEBUILD_ON_COMMIT_BRANCHES: ['test'],
    MEMORY_SIZE: 256,
    TYPE: ['GET', 'POST', 'PUT'],
  },
];

const LAMBDA = {
  SECURITY_GROUP_NAME: 'swe599-lambda-sg',
};

export {LAMBDA, LAMBDA_LIST};
