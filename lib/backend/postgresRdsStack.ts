// CDK
import {RemovalPolicy, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// Interfaces
import {PostgresRdsStackProps} from '../interfaces/PostgresRdsStackProps';

export default class PostgresRdsStack extends Stack {
  props: PostgresRdsStackProps;

  // Set attributes
  private rdsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: PostgresRdsStackProps) {
    super(scope, id, props);

    this.props = props;
  }

  /**
   * Creates a Secret Manager Secret which is used as the RDS Database credentials
   * @returns Secret Manager Secret
   */
  private createRdsSecret(): secretmanager.Secret {
    const rdsSecret = new secretmanager.Secret(this, this.props.secretId, {
      secretName: this.props.secretName,
      description: `${this.props.databaseId} - RDS Postgres Database Secret`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: this.props.secretUsername,
        }),
        generateStringKey: this.props.secretGenerateStringKey,
        excludeCharacters: this.props.secretExcludedCharacters,
      },
    });

    return rdsSecret;
  }
  /**
   * Creates a private Subnet Group for the RDS database
   * @returns RDS Subnet Group
   */
  private createDatabaseSubnet(): rds.SubnetGroup {
    const rdsSubnetGroup = new rds.SubnetGroup(this, this.props.subnetGroupId, {
      description: `${this.props.databaseId} - Postgres RDS Database Subnet Group`,
      vpc: this.props.vpc,
      removalPolicy: RemovalPolicy.DESTROY,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    return rdsSubnetGroup;
  }
  /**
   * Creates a Security Group
   * @param id ID of the Security Group
   * @param props The props of the Security Group specified under the interface ec2.SecurityGroupProps
   * @returns Security Group
   */
  private createSecurityGroup(
    id: string,
    props: ec2.SecurityGroupProps
  ): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(this, id, {
      ...props,
    });

    return securityGroup;
  }

  /**
   * Adds an ingress rule to the given Security Group
   * @param securityGroup The Security Group Object
   * @param peer The peer that access the Security Group
   * @param port The port in which the peer access the Security Group
   * @param description The description of the ingress rule
   */
  private addSecurityGroupIngressRule(
    securityGroup: ec2.SecurityGroup,
    peer: ec2.IPeer,
    port: ec2.Port,
    description: string
  ) {
    securityGroup.addIngressRule(peer, port, description);
  }
}
