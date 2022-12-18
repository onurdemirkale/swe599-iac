// CDK
import {Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';

// Constants

// Interfaces
import LambdaStackProps from '../interfaces/BackendStackProps';

export default class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);
  }
}
