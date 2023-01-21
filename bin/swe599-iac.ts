#!/usr/bin/env node

// CDK
import {App} from 'aws-cdk-lib';

// Constants
import {
  VPC_STACK_NAME,
  CLIENT_STACK_NAME,
  BACKEND_STACK_NAME,
  POSTGRES_RDS_STACK_NAME,
  SECRET_STACK_NAME,
} from '../lib/constants/globalConstant';
import {POSTGRES_RDS} from '../lib/constants/postgresRdsConstant';
import {SECRET} from '../lib/constants/secretStackConstant';

// Stacks
import VpcStack from '../lib/backend/vpcStack';
import ClientStack from '../lib/frontend/clientStack';
import BackendStack from '../lib/backend/backendStack';
import PostgresRdsStack from '../lib/backend/postgresRdsStack';
import SecretStack from '../lib/backend/secretStack';

const app = new App();

// Validate the environment variables
if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
  throw new Error('CDK environment variables are not defined in the CLI.');
}

// Create the Secret stack which handles authentication to various AWS services
const secretStack = new SecretStack(app, SECRET_STACK_NAME, {
  ...SECRET,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

secretStack.connectCodebuildToGitHub();

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

const postgresRdsStack = new PostgresRdsStack(app, POSTGRES_RDS_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpc: vpcStack.vpc,
  databaseId: POSTGRES_RDS.databaseId,
  databaseSecurityGroupId: POSTGRES_RDS.databaseSecurityGroupId,
  subnetGroupId: POSTGRES_RDS.subnetGroupId,
  bastionHostId: POSTGRES_RDS.bastionHostId,
  bastionHostInstanceName: POSTGRES_RDS.bastionHostInstanceName,
  bastionHostSecurityGroupId: POSTGRES_RDS.bastionHostSecurityGroupId,
  secretId: POSTGRES_RDS.secretId,
  secretName: POSTGRES_RDS.secretName,
  secretUsername: POSTGRES_RDS.secretUsername,
  secretGenerateStringKey: POSTGRES_RDS.secretGenerateStringKey,
});

const postgresRdsInstance = postgresRdsStack.createPostgresDatabase();

new BackendStack(app, BACKEND_STACK_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpc: vpcStack.vpc,
  postgresRdsInstance: postgresRdsInstance,
});
