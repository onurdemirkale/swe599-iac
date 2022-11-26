#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import ClientStack from '../lib/client';
import stackConstant from '../constants/stackConstant';

const app = new cdk.App();

// Create the client stack which hosts the React web application
new ClientStack(app, stackConstant.CLIENT_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
