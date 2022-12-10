#!/usr/bin/env node

// CDK
import {App} from 'aws-cdk-lib';

// Constants
import STACK from '../constants/stackConstant';

// Stacks
import VpcStack from '../lib/backend/vpcStack';
import ClientStack from '../lib/clientStack';

const app = new App();

// Validate the environment variables
if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
  throw new Error('CDK environment variables are not defined in the CLI.');
}

// Create the VPC stack which provides the virtual network for the resources
new VpcStack(app, STACK.VPC_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Create the client stack which hosts the React web application
new ClientStack(app, STACK.CLIENT_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
