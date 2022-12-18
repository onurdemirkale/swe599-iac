import {StackProps} from 'aws-cdk-lib';

interface LambdaStackProps extends StackProps {
  lambdaFunctionName: string;
  sourceCodeRepositoryName: string;
  sourceCodeRepositoryOwner: string;
  sourceCodeRepositoryBranch: string;
  githubTokenSecretName: string;
  githubTokenSecretField: string;
}

export {LambdaStackProps};
