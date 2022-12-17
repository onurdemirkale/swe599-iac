import LambdaConstant from '../interfaces/LambdaConstant';
import {aws_lambda} from 'aws-cdk-lib';

const LAMBDA_LIST: LambdaConstant[] = [
  {
    NAME: 'test',
    ARCHITECTURE: aws_lambda.Architecture.ARM_64,
    CODEBUILD_ON_COMMIT_BRANCHES: ['test', 'test2'],
    MEMORY_SIZE: 256,
    TYPE: ['GET', 'POST', 'PUT'],
    PATH: '/login',
  },
];

const LAMBDA = {
  SECURITY_GROUP_NAME: 'swe599-lambda-sg',
};

export {LAMBDA, LAMBDA_LIST};
