// CDK
import {RemovalPolicy, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Interfaces
import {PostgresRdsStackProps} from '../interfaces/PostgresRdsStackProps';

export default class PostgresRdsStack extends Stack {
  props: PostgresRdsStackProps;

  // Set attributes
  private rdsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: PostgresRdsStackProps) {
    super(scope, id, props);

    this.props = props;
  }

}
