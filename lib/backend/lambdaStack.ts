// CDK
import {Stack, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';

// Libraries
import * as path from 'path';

// Constants

// Interfaces
import {LambdaStackProps} from '../interfaces/LambdaStackProps';

export default class LambdaStack extends Stack {
  props: LambdaStackProps;

  // Set attributes
  public lambdaFunction: lambda.Function;

  // Generated attributes
  private lambdaCodebuildProjectName: string;
  private lambdaCodebuildPolicyName: string;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    props = this.props;

    // Generated attributes
    this.lambdaCodebuildProjectName = `${props.lambdaFunctionName}-Codebuild-Project`;
    this.lambdaCodebuildPolicyName = `${props.lambdaFunctionName}-Codebuild-Policy`;

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
    const lambdaFunction = new lambda.Function(
      this,
      this.props.lambdaFunctionName,
      {
        code: lambdaCode,
        handler: 'index.main',
        runtime: lambda.Runtime.NODEJS_16_X,
      }
    );

    this.lambdaFunction = lambdaFunction;

    return lambdaFunction;
  }

  attachDynamoDB() {}

  attachRDS() {}

  addToSecurityGroup() {}

  // Creates the pipeline for the given Lambda function.
  createLambdaPipeline() {
    const lambdaPipeline = new codepipeline.Pipeline(this, 'Pipeline');

    const artifactBucketName = lambdaPipeline.artifactBucket.bucketName;

    const lambdaSourceOutput = new codepipeline.Artifact();
    const lambdaSourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: 'LambdaCodeSource',
      owner: this.props.sourceCodeRepositoryOwner,
      repo: this.props.sourceCodeRepositoryName,
      branch: this.props.sourceCodeRepositoryBranch,
      oauthToken: SecretValue.secretsManager(this.props.githubTokenSecretName, {
        jsonField: this.props.githubTokenSecretField,
      }),
      output: lambdaSourceOutput,
    });

    lambdaPipeline.addStage({
      stageName: 'Source',
      actions: [lambdaSourceAction],
    });

    const lambdaBuildProject = new codebuild.Project(
      this,
      this.lambdaCodebuildProjectName,
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
        },
        buildSpec: this.getLambdaBuildspec(
          artifactBucketName,
          this.lambdaFunction.functionArn
        ),
      }
    );

    lambdaBuildProject.role?.addManagedPolicy(
      this.getCodebuildPolicy(
        artifactBucketName,
        this.lambdaFunction.functionArn,
        this.lambdaCodebuildPolicyName
      )
    );

    const lambdaBuildOutput = new codepipeline.Artifact();
    const lambdaBuildAction = new codepipelineActions.CodeBuildAction({
      actionName: 'LambdaBuild',
      project: lambdaBuildProject,
      input: lambdaSourceOutput,
      outputs: [lambdaBuildOutput],
    });

    lambdaPipeline.addStage({
      stageName: 'Build',
      actions: [lambdaBuildAction],
    });
  }

  private getLambdaBuildspec(
    bucketName: string,
    lambdaFunctionArn: string
  ): codebuild.BuildSpec {
    const buildspec = codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          'runtime-versions': {
            nodejs: '16.x',
          },
          commands: 'npm install',
        },
        build: {
          commands: ['npm run build', 'zip handler.zip handler.js'],
        },
        post_build: {
          commands: [
            `aws s3api put-object --bucket ${bucketName} --key handler.zip --body handler.zip --expected-bucket-owner ${process.env.CDK_DEFAULT_ACCOUNT}`,
            'wait',
            `aws lambda update-function-code --function-name ${lambdaFunctionArn} --s3-bucket ${bucketName} --s3-key handler.zip`,
          ],
        },
      },
      artifacts: {
        files: ['handler.js', 'node_modules/**/*'],
      },
    });

    return buildspec;
  }

  private getCodebuildPolicy(
    artifactBucketName: string,
    lambdaFunctionArn: string,
    codebuildPolicyName: string
  ): iam.ManagedPolicy {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowS3Access',
          Effect: 'Allow',
          Action: ['s3:Put*', 's3:Get*', 's3:List*'],
          Resource: [
            `arn:aws:s3:::${artifactBucketName}`,
            `arn:aws:s3:::${artifactBucketName}/*`,
          ],
        },
        {
          Sid: 'AllowLambdaUpdate',
          Effect: 'Allow',
          Action: 'lambda:Update*',
          Resource: lambdaFunctionArn,
        },
      ],
    };

    const codebuildPolicyDocument = iam.PolicyDocument.fromJson(policyDocument);
    const codebuildPolicy = new iam.ManagedPolicy(this, codebuildPolicyName, {
      document: codebuildPolicyDocument,
    });

    return codebuildPolicy;
  }
}
