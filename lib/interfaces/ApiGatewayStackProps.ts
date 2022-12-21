import {StackProps} from 'aws-cdk-lib';

interface ApiGatewayStackProps extends StackProps {
  apiGatewayName: string;
  apiGatewayDescription: string;
  apiGatewayStageName: string;
  apiGatewayAllowMethods: (
    | 'OPTIONS'
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
  )[];
  apiGatewayAllowHeaders: string[];
  apiGatewayAllowCredentials: boolean;
  apiGatewayAllowOrigins: string[];
}

export {ApiGatewayStackProps};
