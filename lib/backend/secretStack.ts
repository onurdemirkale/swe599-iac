// CDK
import {Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {SecretValue} from 'aws-cdk-lib';
import {GitHubSourceCredentials} from 'aws-cdk-lib/aws-codebuild';

// Interfaces
import {SecretStackProps} from '../interfaces/SecretStackProps';

/**
 * A CDK stack that is responsible of handling the authentication
 * to AWS services. The name Secret is used as a reference to AWS
 * Secrets Manager, no secret values are handled explicitly.
 */
export default class SecretStack extends Stack {
  props: SecretStackProps;

  constructor(scope: Construct, id: string, props: SecretStackProps) {
    super(scope, id, props);

    this.props = props;
  }

  /**
   * // Authenticate to GitHub repository through codebuild using credentials stored in secrets manager
   */
  public connectCodebuildToGitHub() {
    new GitHubSourceCredentials(this, this.props.codebuildCredentialsName, {
      accessToken: SecretValue.secretsManager(this.props.githubTokenName, {
        jsonField: 'accessToken',
      }),
    });
  }
}
