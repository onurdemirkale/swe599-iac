import {StackProps} from 'aws-cdk-lib';
import {Vpc} from 'aws-cdk-lib/aws-ec2';
import {DatabaseInstance} from 'aws-cdk-lib/aws-rds';

interface BackendStackProps extends StackProps {
  vpc: Vpc;
  postgresRdsInstance: DatabaseInstance;
}

export {BackendStackProps};
