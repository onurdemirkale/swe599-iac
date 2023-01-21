// CDK
import {Stack, StackProps, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';

// Constants
import {CLIENT} from '../constants/clientConstant';

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
    const deploymentBucket = new s3.Bucket(this, CLIENT.BUCKET_NAME, {
      bucketName: CLIENT.BUCKET_NAME,
      encryption: s3.BucketEncryption.UNENCRYPTED,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY, // Enables automatic deletion during `cdk destroy`
      autoDeleteObjects: true,
    });

    // Read buildspec
    const buildspecYaml = readFileSync(CLIENT.BUILDSPEC_PATH, 'utf-8');

    // Parse buildspec
    const buildspec = yaml.parse(buildspecYaml);

    // Create a CodeBuild Project and deploy the artifact to previously created S3 Bucket
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const codeBuildProject = new codebuild.Project(
      this,
      CLIENT.CODEBUILD_PROJECT_NAME,
      {
        projectName: CLIENT.CODEBUILD_PROJECT_NAME,
        source: codebuild.Source.gitHub({
          repo: CLIENT.REPOSITORY_NAME,
          owner: CLIENT.REPOSITORY_OWNER,
          webhook: true,
          webhookFilters: [
            codebuild.FilterGroup.inEventOf(
              codebuild.EventAction.PULL_REQUEST_MERGED
            ).andBaseBranchIs(CLIENT.DEPLOYMENT_BRANCH),
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
