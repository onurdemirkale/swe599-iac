const clientConstant = {
  BUCKET_NAME: 'swe599-client-bucket',
  CODEBUILD_CREDENTIALS_NAME: 'codeBuildGithubCredentials',
  GITHUB_TOKEN_NAME: 'github-auth-token',
  CODEBUILD_PROJECT_NAME: 'swe599-codebuild-project',
  REPOSITORY_NAME: 'swe599-web',
  REPOSITORY_OWNER: 'onurdemirkale',
  DEPLOYMENT_BRANCH: 'main',
  BUILDSPEC_PATH: './lib/buildspec/react-buildspec.yml',
};

export default clientConstant;
