import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ApiStack } from '../lib/api-stack';

test('creates provided.al2023 lambda', () => {
  const app = new cdk.App();
  const stack = new ApiStack(app, 'TestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::Function', { Runtime: 'provided.al2023' });
});

test('creates http api', () => {
  const app = new cdk.App();
  const stack = new ApiStack(app, 'TestStack2');
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
});
