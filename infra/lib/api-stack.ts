import * as path from 'path';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = path.join(__dirname, '..', '..');

    const vpc = new ec2.Vpc(this, 'Vpc', {
      natGateways: 1,
      availabilityZones: ['us-east-1a', 'us-east-1b'],
    });

    const dbSecret = new rds.DatabaseSecret(this, 'DbSecret', {
      username: 'postgres',
    });

    const db = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_4,
      }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      writer: rds.ClusterInstance.serverlessV2('writer'),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      defaultDatabaseName: 'usernames',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const code = lambda.Code.fromAsset(projectRoot, {
      exclude: ['target', 'infra', '.git', 'node_modules', 'cdk.out'],
      bundling: {
        image: cdk.DockerImage.fromRegistry('rust:1.82'),
        command: [
          'bash',
          '-c',
          'cargo build --release --bin usernames-api && cp target/release/usernames-api /asset-output/bootstrap',
        ],
        user: 'root',
        workingDirectory: '/asset-input',
        local: {
          tryBundle(outputDir: string): boolean {
            const res = spawnSync('cargo', ['build', '--release', '--bin', 'usernames-api'], {
              cwd: projectRoot,
              stdio: 'inherit',
            });
            if (res.status !== 0) {
              return false;
            }
            fs.mkdirSync(outputDir, { recursive: true });
            fs.copyFileSync(
              path.join(projectRoot, 'target', 'release', 'usernames-api'),
              path.join(outputDir, 'bootstrap'),
            );
            fs.chmodSync(path.join(outputDir, 'bootstrap'), 0o755);
            return true;
          },
        },
      },
    });

    const fn = new lambda.Function(this, 'ApiFunction', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      environment: {
        DATABASE_URL: `postgres://${dbSecret.secretValueFromJson('username').unsafeUnwrap()}:${dbSecret.secretValueFromJson('password').unsafeUnwrap()}@${db.clusterEndpoint.hostname}:${db.clusterEndpoint.port}/usernames`,
        RUST_LOG: 'info',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    dbSecret.grantRead(fn);

    const httpApi = new apigw.HttpApi(this, 'HttpApi', {
      defaultIntegration: new integrations.HttpLambdaIntegration('LambdaIntegration', fn),
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: httpApi.url ?? '' });
    new cdk.CfnOutput(this, 'DbSecretArn', { value: dbSecret.secretArn });
  }
}
