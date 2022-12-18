// CDK
import {Construct} from 'constructs';
import {SecretValue, Stack, StackProps} from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class LambdaPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Env variable checks
    if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
      throw new Error(
        'CDK - Undefined CDK credentials in environment variables.'
      );
    }

    const lambdaStack = new Stack(this, 'LambdaStack');
    const lambdaCode = lambda.Code.fromAsset(
      path.join(__dirname, '/../lambda/')
    );
    new lambda.Function(lambdaStack, 'Lambda', {
      code: lambdaCode,
      handler: 'handler.main',
      runtime: lambda.Runtime.NODEJS_14_X,
    });
    // other resources that your Lambda needs, added to the lambdaStack...

    const pipelineStack = new Stack(this, 'PipelineStack');
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
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              commands: 'npm install',
            },
            build: {
              commands: [
                'npm run build',
                'node --version',
                'npm run cdk synth -- -v -o dist', // DEBUGGING TO SEE POSSIBLE STACKS
                'npm run cdk synth backendStack/LambdaPipelineStack/LambdaStack -- -o .',
              ],
            },
          },
          artifacts: {
            files: 'LambdaStack.template.yaml',
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
  }
}
