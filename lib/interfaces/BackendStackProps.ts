import {StackProps} from 'aws-cdk-lib';
import {Vpc} from 'aws-cdk-lib/aws-ec2';

interface BackendStackProps extends StackProps {
  vpc: Vpc;
}

export default BackendStackProps;
