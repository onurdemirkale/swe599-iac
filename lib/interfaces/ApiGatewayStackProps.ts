import {StackProps} from 'aws-cdk-lib';

interface ApiGatewayStackProps extends StackProps {
  apiGatewayDescription: string;
  apiGatewayStageName: string;
  apiGatewayAllowedMethods: [
    'OPTIONS' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  ];
  apiGatewayAllowHeaders: string[];
  apiGatewayAllowMethods: string[];
  apiGatewayAllowCredentials: boolean;
  apiGatewayAllowOrigins: string[];
}

export {ApiGatewayStackProps};
