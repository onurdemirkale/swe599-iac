import {StackProps} from 'aws-cdk-lib';

interface SecretStackProps extends StackProps {
  codebuildCredentialsName: string;
  codebuildProjectName: string;
  githubTokenName: string;
}

export {SecretStackProps};
