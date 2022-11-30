// CDK
import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';

// Constants
import backendConstant from '../constants/clientConstant';

export default class Backend extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
