// CDK
import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Constants
import {API_GATEWAY} from '../constants/apiGatewayConstant';

// Interfaces
import {ApiGatewayStackProps} from '../interfaces/ApiGatewayStackProps';

export default class ApiGatewayStack extends Stack {
  props: ApiGatewayStackProps;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    props = this.props;
  }

  /**
   * @returns Rest API URL
   */
  createApi(): string {
    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'api', {
      description: this.props.apiGatewayDescription,
      deployOptions: {
        stageName: this.props.apiGatewayStageName,
      },

      // Enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: this.props.apiGatewayAllowHeaders,
        allowMethods: this.props.apiGatewayAllowMethods,
        allowCredentials: this.props.apiGatewayAllowCredentials,
        allowOrigins: this.props.apiGatewayAllowOrigins,
      },
    });

    // Create an Output for the API URL
    new CfnOutput(this, 'apiUrl', {value: api.url});

    return api.url;
  }
}
