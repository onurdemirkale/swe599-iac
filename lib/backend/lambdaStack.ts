// CDK
import {Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';

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
  createLambdaPipeline() {}
  lambdaPipeline = new codepipeline.Pipeline(this, 'Pipeline');
}
