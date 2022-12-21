// CDK
import {Stack, StackProps, CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Constants
import {API_GATEWAY} from '../constants/apiGatewayConstant';

// Interfaces
import {ApiGatewayStackProps} from '../interfaces/ApiGatewayStackProps';

export default class ApiGatewayStack extends Stack {
  props: ApiGatewayStackProps;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    this.props = props;
  }

  /**
   * @returns Rest API URL
   */
  createApi(): apigateway.RestApi {
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

    return api;
  }

  /**
   * Creates an API Gateway root Resource.
   * @param api The API Gateway of the root Resource.
   * @param rootPath The path of the root Resource.
   * @returns An API Gateway Root Resource.
   */
  createRootResource(
    api: apigateway.RestApi,
    rootPath: string
  ): apigateway.Resource {
    const rootResource = api.root.addResource(rootPath);

    return rootResource;
  }

  /**
   * Integares an API Gateway Resource with a Lambda Function.
   * @param lambdaFunction The Lambda Function to be integrated.
   * @param apiGatewayResource The API Gateway Resource that the Lambda Function will be integrated to.
   * @param resourceMethod The HTTP method.
   */
  addLambda(
    lambdaFunction: lambda.Function,
    apiGatewayResource: apigateway.Resource,
    resourceMethod: 'OPTIONS' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  ) {
    apiGatewayResource.addMethod(
      resourceMethod,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
  }

  /**
   * Adds an API Gateway Resource to a given API Gateway Root Resource.
   * @param rootResource The API Gateway Root Resource object.
   * @param resourcePath The path for the API Gateway Resource.
   * @returns
   */
  addResource(
    rootResource: apigateway.Resource,
    resourcePath: 'string'
  ): apigateway.Resource {
    const resource = rootResource.addResource(resourcePath);

    return resource;
  }
}
