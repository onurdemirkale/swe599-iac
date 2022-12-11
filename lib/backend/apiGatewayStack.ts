// CDK
import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Constants
import {API_GATEWAY} from '../../constants/apiGatewayConstant';

export default class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'api', {
      description: API_GATEWAY.DESCRIPTION,
      deployOptions: {
        stageName: API_GATEWAY.STAGE,
      },

      // Enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],

        // Deep copy to a new array as the constant can't be assigned to mutable type 'string[]
        allowMethods: [...API_GATEWAY.ALLOWED_METHODS],
        allowCredentials: true,
        allowOrigins: [API_GATEWAY.ALLOWED_ORIGINS],
      },
    });

    // Create an Output for the API URL
    new CfnOutput(this, 'apiUrl', {value: api.url});
  }
}
