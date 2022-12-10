// CDK
import {aws_lambda} from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

class LambdaModel {
  public arn: string;
  public lambdaName: string;
  public lambdaArchitecture: aws_lambda.Architecture;
  public memorySize: number;
  public lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(
    vpc: ec2.Vpc,
    lambdaName: string,
    lambdaArchitecture: aws_lambda.Architecture,
    codeBuildOnCommitBranches: string[],
    memorySize: number,
    lambdaSecurityGroup: ec2.SecurityGroup
  ) {
    // Placeholder code
    // The Lambda function and its related resources will be created here
    this.arn = 'placeholder';
  }
}

export default LambdaModel;
