# Welcome to SWE599 Infrastructure as Code repository.

The Infrastructure as Code is implemented using the AWS Cloud Development Kit (CDK). The language of the project is TypeScript. The project is formatted using Google TypeScript Style (GTS). Please take a look at usage and useful commands below.

## Usage

### 1) Install the AWS CLI:

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### 2) Configure your AWS account:

Locate your .aws directory in which the config and credentials are stored. Export your AWS profile to the CLI to create a temporary session using:

```
export AWS_PROFILE=profile_name
```

OR

Configure your AWS account using:

```
aws configure
```

The CDK commands can now be executed.

### 3) Connect your GitHub repository to CodeBuild:

When connecting a GitHub repository to CodeBuild, please follow the link below.

https://docs.aws.amazon.com/codebuild/latest/userguide/access-tokens.html

The access token obtained should be stored in the Secrets Manager on your AWS account. This is the only manual process required during resource creation and is required for the security of your credentials.

### 4) Update constant variables:

Modify constants according to your stack properties.

Remember that some resources may have globally unique names, thus usually a modification is necessary.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
