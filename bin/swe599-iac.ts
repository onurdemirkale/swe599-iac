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

// // Create the VPC stack which provides the virtual network for the resources
// const vpcStack = new VpcStack(app, VPC_STACK_NAME, {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
// });

// // Create the client stack which hosts the React web application
// new ClientStack(app, CLIENT_STACK_NAME, {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
// });

// Create the client stack which hosts the React web application
// new BackendStack(app, 'backendStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
//   vpc: vpcStack.vpc,
// });

// new LambdaPipelineStack(app, 'LambdaPipelineStack', {
//   env: {},
// });

const lambdaStack = new Stack(app, 'LambdaStack');
const lambdaCode = lambda.Code.fromAsset(
  path.join(__dirname, '/../lib/lambda/')
);
const func = new lambda.Function(lambdaStack, 'Lambda', {
  code: lambdaCode,
  handler: 'index.handler',
  runtime: lambda.Runtime.NODEJS_14_X,
});
// used to make sure each CDK synthesis produces a different Version
const version = func.currentVersion;

const alias = new lambda.Alias(lambdaStack, 'LambdaAlias', {
  aliasName: 'Prod',
  version,
});

new codedeploy.LambdaDeploymentGroup(lambdaStack, 'DeploymentGroup', {
  alias,
  deploymentConfig:
    codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
});

const pipelineStack = new Stack(app, 'PipelineStack');
const pipeline = new codepipeline.Pipeline(pipelineStack, 'Pipeline');
const cdkSourceOutput = new codepipeline.Artifact();
const cdkSourceAction = new codepipeline_actions.GitHubSourceAction({
  actionName: 'CdkCode_Source',
  owner: 'onurdemirkale',
  repo: 'swe599-iac',
  branch: 'main',
  oauthToken: SecretValue.secretsManager('github-auth-token', {
    jsonField: 'accessToken',
  }),
  output: cdkSourceOutput,
});

const lambdaSourceOutput = new codepipeline.Artifact();
const lambdaSourceAction = new codepipeline_actions.GitHubSourceAction({
  actionName: 'LambdaCode_Source',
  owner: 'onurdemirkale',
  repo: 'swe599-backend',
  branch: 'main',
  oauthToken: SecretValue.secretsManager('github-auth-token', {
    jsonField: 'accessToken',
  }),
  output: lambdaSourceOutput,
});

pipeline.addStage({
  stageName: 'Source',
  actions: [cdkSourceAction, lambdaSourceAction],
});

const cdkBuildProject = new codebuild.Project(
  pipelineStack,
  'CdkBuildProject',
  {
    environment: {
      buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
    },
    buildSpec: codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          'runtime-versions': {
            nodejs: '14.x',
          },
        },
        build: {
          commands: [
            'npm install',
            'npm run build',
            'npm run cdk synth',
            'npm run cdk synth LambdaStack -o .',
            'mv cdk.out/LambdaStack.template.json .',
            'ls',
          ],
        },
      },
      artifacts: {
        files: 'LambdaStack.template.json',
      },
    }),
  }
);
const cdkBuildOutput = new codepipeline.Artifact();
const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
  actionName: 'CDK_Build',
  project: cdkBuildProject,
  input: cdkSourceOutput,
  outputs: [cdkBuildOutput],
});

// build your Lambda code, using CodeBuild
// again, this example assumes your Lambda is written in TypeScript/JavaScript -
// make sure to adjust the build environment and/or commands if they don't match your specific situation
const lambdaBuildProject = new codebuild.Project(
  pipelineStack,
  'LambdaBuildProject',
  {
    environment: {
      buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2,
    },
    buildSpec: codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          commands: 'npm install',
        },
        build: {
          commands: 'npm run build',
        },
      },
      artifacts: {
        files: ['index.js', 'node_modules/**/*'],
      },
    }),
  }
);
const lambdaBuildOutput = new codepipeline.Artifact();
const lambdaBuildAction = new codepipeline_actions.CodeBuildAction({
  actionName: 'Lambda_Build',
  project: lambdaBuildProject,
  input: lambdaSourceOutput,
  outputs: [lambdaBuildOutput],
});

pipeline.addStage({
  stageName: 'Build',
  actions: [lambdaBuildAction, cdkBuildAction],
});

// finally, deploy your Lambda Stack
pipeline.addStage({
  stageName: 'Deploy',
  actions: [
    new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Lambda_CFN_Deploy',
      templatePath: cdkBuildOutput.atPath('LambdaStack.template.yaml'),
      stackName: 'LambdaStackDeployedName',
      adminPermissions: true,
      extraInputs: [lambdaBuildOutput],
    }),
  ],
});
