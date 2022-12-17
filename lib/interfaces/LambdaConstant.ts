import {aws_lambda} from 'aws-cdk-lib';

// The LambdaConstnat interface is used to define constants, thus its
// attributes are written in upper case
interface LambdaConstant {
  NAME: string;
  ARCHITECTURE: aws_lambda.Architecture;
  CODEBUILD_ON_COMMIT_BRANCHES: string[];
  MEMORY_SIZE: number;
  TYPE: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'AUTH')[];
  PATH: '/login';
}

export default LambdaConstant;
