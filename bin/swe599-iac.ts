#!/usr/bin/env node

// CDK
import {App} from 'aws-cdk-lib';

// Constants
import {
  VPC_STACK_NAME,
  CLIENT_STACK_NAME,
} from '../lib/constants/globalConstant';

// Stacks
import VpcStack from '../lib/backend/vpcStack';
import ClientStack from '../lib/frontend/clientStack';
import BackendStack from '../lib/backend/backendStack';

const app = new App();

// Validate the environment variables
if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
  throw new Error('CDK environment variables are not defined in the CLI.');
}

// Create the VPC stack which provides the virtual network for the resources
const vpcStack = new VpcStack(app, VPC_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Create the client stack which hosts the React web application
new ClientStack(app, CLIENT_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Create the client stack which hosts the React web application
new BackendStack(app, 'backendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpc: vpcStack.vpc,
});
