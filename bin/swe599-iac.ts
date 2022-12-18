#!/usr/bin/env node

// CDK
import {App} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {SecretValue, Stack, StackProps} from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as path from 'path';

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

new BackendStack(app, 'backendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpc: vpcStack.vpc,
});
