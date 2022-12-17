import {aws_lambda} from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

type LambdaFunction = (
  vpc: ec2.Vpc,
  name: string,
  architecture: aws_lambda.Architecture,
  codeBuildOnCommitBranches: string[],
  memorySize: number,
  lambdaSecurityGroup: ec2.SecurityGroup
) => string;

export default LambdaFunction;
