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
   * Creates an RDS Postgres Database and its Subnet and Security configuration.
   */
  createPostgresDatabase(): rds.DatabaseInstance {
    const rdsSecret = this.createRdsSecret();
    const rdsSubnet = this.createDatabaseSubnet();
    const rdsSecurityGroup = this.createSecurityGroup(
      this.props.databaseSecurityGroupId,
      {vpc: this.props.vpc}
    );

    // RDS Security Group attribute is set so that it can be accessed
    // later if a Bastion Host is created
    this.rdsSecurityGroup = rdsSecurityGroup;

    // Create the Postgres RDS Database instance
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const rdsPostgresInstance = new rds.DatabaseInstance(
      this,
      this.props.databaseId,
      {
        databaseName: 'postgres',
        vpc: this.props.vpc,
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_13_7,
        }),
        credentials: rds.Credentials.fromSecret(rdsSecret),
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        maxAllocatedStorage: 200,
        publiclyAccessible: false,
        removalPolicy: RemovalPolicy.DESTROY,

        subnetGroup: rdsSubnet,
        securityGroups: [rdsSecurityGroup],
      }
    );

    return rdsPostgresInstance;
  }

  /**
   * Creates a Bastion Host for the RDS Postgres Database
   */
  createBastionHost() {
    // Create a security group for the Bastion Host
    const bastionHostSecurityGroup = this.createSecurityGroup(
      this.props.bastionHostSecurityGroupId,
      {vpc: this.props.vpc}
    );

    // Add an ingress rule for SSH
    this.addSecurityGroupIngressRule(
      bastionHostSecurityGroup,
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      `${this.props.databaseId} - Bastion Host SSH Ingress`
    );

    // Add an ingress rule to the RDS Security Group so that
    // it is accesible from the Bastion Host
    this.addSecurityGroupIngressRule(
      this.rdsSecurityGroup,
      bastionHostSecurityGroup,
      ec2.Port.tcp(5432),
      `${this.props.databaseId} - Bastion Host Ingress`
    );

    // Create the Bastion Host
    new ec2.BastionHostLinux(this, this.props.bastionHostId, {
      vpc: this.props.vpc,
      subnetSelection: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: this.props.bastionHostInstanceName,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      securityGroup: bastionHostSecurityGroup,
    });
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
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: this.props.secretGenerateStringKey,
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
