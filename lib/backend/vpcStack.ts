// CDK
import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {VPC} from '../../constants/vpcConstant';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export default class VpcStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, VPC.ID, {
      vpcName: VPC.NAME,
      cidr: VPC.CIDR,
      maxAzs: VPC.MAX_AZ,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    this.vpc = vpc;
  }
}
