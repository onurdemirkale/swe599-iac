// CDK
import {Stack, StackProps, RemovalPolicy, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';

// Constants
import clientConstant from '../constants/clientConstant';

// File system
import {readFileSync} from 'fs';

// Third party
import * as yaml from 'yaml';

/**
 * A CDK Stack that is suitable for deploying a React web application.
 * This stack includes a CodeBuild project which deploys its artifact to a
 * provisioned S3 Bucket.
 * The S3 Bucket is provisioned with a configuration to enable static website
 * hosting.
 */
export default class Client extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create an S3 Bucket for static web application hosting
    const deploymentBucket = new s3.Bucket(this, clientConstant.BUCKET_NAME, {
      bucketName: clientConstant.BUCKET_NAME,
      encryption: s3.BucketEncryption.UNENCRYPTED,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY, // Enables automatic deletion during `cdk destroy`
      autoDeleteObjects: true,
    });

    // Authenticate to GitHub repository through codebuild using credentials stored in secrets manager
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const codebuildCredentials = new codebuild.GitHubSourceCredentials(
      this,
      clientConstant.CODEBUILD_CREDENTIALS_NAME,
      {
        accessToken: SecretValue.secretsManager(
          clientConstant.GITHUB_TOKEN_NAME,
          {jsonField: 'accessToken'}
        ),
      }
    );

    // Read buildspec
    const buildspecYaml = readFileSync(clientConstant.BUILDSPEC_PATH, 'utf-8');

    // Parse buildspec
    const buildspec = yaml.parse(buildspecYaml);

    // Create a CodeBuild Project and deploy the artifact to previously created S3 Bucket
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const codeBuildProject = new codebuild.Project(
      this,
      clientConstant.CODEBUILD_PROJECT_NAME,
      {
        projectName: clientConstant.CODEBUILD_PROJECT_NAME,
        source: codebuild.Source.gitHub({
          repo: clientConstant.REPOSITORY_NAME,
          owner: clientConstant.REPOSITORY_OWNER,
          webhook: true,
          webhookFilters: [
            codebuild.FilterGroup.inEventOf(
              codebuild.EventAction.PULL_REQUEST_MERGED
            ).andBranchIs(clientConstant.DEPLOYMENT_BRANCH),
          ],
        }),
        buildSpec: codebuild.BuildSpec.fromObjectToYaml(buildspec),
        artifacts: codebuild.Artifacts.s3({
          bucket: deploymentBucket,
          name: '/',
          includeBuildId: false,
          encryption: false,
          packageZip: false,
        }),
        environment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
          computeType: codebuild.ComputeType.SMALL,
        },
        checkSecretsInPlainTextEnvVariables: false,
      }
    );
  }
}
