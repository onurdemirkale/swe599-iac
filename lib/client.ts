import {Stack, StackProps, RemovalPolicy, SecretValue} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import clientConstant from '../constants/clientConstant';

export default class Client extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }

  // Create an S3 Bucket for static web application hosting
  bucket = new s3.Bucket(this, clientConstant.BUCKET_NAME, {
    bucketName: clientConstant.BUCKET_NAME,
    encryption: s3.BucketEncryption.UNENCRYPTED,
    websiteIndexDocument: 'index.html',
    publicReadAccess: true,
    removalPolicy: RemovalPolicy.DESTROY, // Enables automatic deletion during `cdk destroy`
    autoDeleteObjects: true,
  });

  // Authenticate to GitHub repository through codebuild using credentials stored in secrets manager
  codebuildCredentials = new codebuild.GitHubSourceCredentials(
    this,
    clientConstant.CODEBUILD_CREDENTIALS_NAME,
    {
      accessToken: SecretValue.secretsManager(clientConstant.GITHUB_TOKEN_NAME),
    }
  );
}
