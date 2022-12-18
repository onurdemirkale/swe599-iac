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
  // Set attributes
  public lambdaFunction: lambda.Function;
  private artifactBucketName: string;

  // Attributes obtained from props
  private lambdaFunctionName: string;
  private sourceCodeRepositoryName: string;
  private sourceCodeRepositoryOwner: string;
  private sourceCodeRepositoryBranch: string;
  private githubTokenSecretName: string;
  private githubTokenSecretField: string;

  // Generated attributes
  private lambdaCodebuildProjectName: string;
  private lambdaCodebuildPolicyName: string;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Attributes obtained from props
    this.lambdaFunctionName = props.lambdaFunctionName;
    this.sourceCodeRepositoryName = props.sourceCodeRepositoryName;
    this.sourceCodeRepositoryOwner = props.sourceCodeRepositoryOwner;
    this.sourceCodeRepositoryBranch = props.sourceCodeRepositoryBranch;
    this.githubTokenSecretName = props.githubTokenSecretName;
    this.githubTokenSecretField = props.githubTokenSecretField;

    // Generated attributes
    this.lambdaCodebuildProjectName = `${this.lambdaFunctionName}-Codebuild-Project`;
    this.lambdaCodebuildPolicyName = `${this.lambdaFunctionName}-Codebuild-Policy`;

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
    const lambdaFunction = new lambda.Function(this, this.lambdaFunctionName, {
      code: lambdaCode,
      handler: 'index.main',
      runtime: lambda.Runtime.NODEJS_16_X,
    });

    this.lambdaFunction = lambdaFunction;

    return lambdaFunction;
  }

  attachDynamoDB() {}

  attachRDS() {}

  addToSecurityGroup() {}

  // Creates the pipeline for the given Lambda function.
  createLambdaPipeline() {
    const lambdaPipeline = new codepipeline.Pipeline(this, 'Pipeline');

    this.artifactBucketName = lambdaPipeline.artifactBucket.bucketName;

    const lambdaSourceOutput = new codepipeline.Artifact();
    const lambdaSourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: 'LambdaCodeSource',
      owner: this.sourceCodeRepositoryOwner,
      repo: this.sourceCodeRepositoryName,
      branch: this.sourceCodeRepositoryBranch,
      oauthToken: SecretValue.secretsManager(this.githubTokenSecretName, {
        jsonField: this.githubTokenSecretField,
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
