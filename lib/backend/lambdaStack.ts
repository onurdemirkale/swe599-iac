// CDK
import {Stack, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';

// Libraries
import * as path from 'path';

// Constants

// Interfaces
import {LambdaStackProps} from '../interfaces/LambdaStackProps';

export default class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Environment variable checks
    if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
      throw new Error(
        'CDK credentials are not defined the environment variables!'
      );
    }
  }

  // Initializes the dummy Lambda function. This function is updated when the
  // CodePipeline is created.
  createLambdaFunction(): lambda.Function {
    const lambdaCode = lambda.Code.fromAsset(
      path.join(__dirname, '/../lambda/')
    );
    const lambdaFunction = new lambda.Function(this, 'Lambda', {
      code: lambdaCode,
      handler: 'handler.main',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    return lambdaFunction;
  }

  // Creates the pipeline for the given Lambda function.
  createLambdaPipeline() {
    const lambdaPipeline = new codepipeline.Pipeline(this, 'Pipeline');

    const lambdaSourceOutput = new codepipeline.Artifact();
    const lambdaSourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: 'LambdaCode_Source',
      owner: 'onurdemirkale',
      repo: 'swe599-backend',
      branch: 'main',
      oauthToken: SecretValue.secretsManager('github-auth-token', {
        jsonField: 'accessToken',
      }),
      output: lambdaSourceOutput,
    });

    lambdaPipeline.addStage({
      stageName: 'Source',
      actions: [lambdaSourceAction],
    });

    const lambdaBuildProject = new codebuild.Project(
      this,
      'LambdaBuildProject',
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2,
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: '18.x',
              },
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
    const lambdaBuildAction = new codepipelineActions.CodeBuildAction({
      actionName: 'Lambda_Build',
      project: lambdaBuildProject,
      input: lambdaSourceOutput,
      outputs: [lambdaBuildOutput],
    });

    lambdaPipeline.addStage({
      stageName: 'Build',
      actions: [lambdaBuildAction],
    });
  }
}
