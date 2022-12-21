import {ApiGatewayStackProps} from '../interfaces/ApiGatewayStackProps';

const API_GATEWAY: ApiGatewayStackProps = {
  apiGatewayName: 'swe599Api',
  apiGatewayDescription: 'SWE599 REST API',
  apiGatewayStageName: 'dev',
  apiGatewayAllowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  apiGatewayAllowHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
  ],
  apiGatewayAllowCredentials: true,
  apiGatewayAllowOrigins: ['http://localhost:3000'],
};

export {API_GATEWAY};
