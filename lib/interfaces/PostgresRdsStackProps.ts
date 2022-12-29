import {StackProps} from 'aws-cdk-lib';
import {Vpc} from 'aws-cdk-lib/aws-ec2';

interface PostgresRdsStackProps extends StackProps {
  vpc: Vpc;
  databaseId: string;
  databaseSecurityGroupId: string;
  subnetGroupId: string;
  bastionHostId: string;
  bastionHostInstanceName: string;
  bastionHostSecurityGroupId: string;
  secretId: string;
  secretName: string;
  secretUsername: string;
  secretGenerateStringKey: string;
  secretExcludedCharacters: string;
}

export {PostgresRdsStackProps};
