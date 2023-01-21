import {SecretStackProps} from '../interfaces/SecretStackProps';

const SECRET: SecretStackProps = {
  codebuildCredentialsName: 'codeBuildGithubCredentials',
  codebuildProjectName: 'swe599-codebuild-project',
  githubTokenName: 'github-auth-token',
};

export {SECRET};
