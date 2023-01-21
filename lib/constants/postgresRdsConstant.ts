import {PostgresRdsConstant} from '../interfaces/PostgresRdsConstant';

const POSTGRES_RDS: PostgresRdsConstant = {
  databaseId: 'swe599-rds',
  databaseSecurityGroupId: 'swe599-rds-security-group',
  subnetGroupId: 'swe599-rds-subnet-group',
  bastionHostId: 'swe599-rds-bastion-host',
  bastionHostInstanceName: 'swe599-rds-bastion-host-instance',
  bastionHostSecurityGroupId: 'swe599-rds-bastion-host-security-group',
  secretId: 'swe599-rds-credentials',
  secretName: 'swe599-rds-credentials',
  secretUsername: 'postgres',
  secretGenerateStringKey: 'password',
};

export {POSTGRES_RDS};
