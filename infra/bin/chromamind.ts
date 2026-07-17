#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ChromaMindStack } from '../lib/chromamind-stack';

const app = new cdk.App();

new ChromaMindStack(app, 'ChromaMindStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // CloudFront ACM certs must live in us-east-1; keep the whole stack there
    // for simplicity so a custom-domain cert can be added later without a move.
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'ChromaMind: S3+CloudFront SPA and FastAPI(Mangum) on Lambda behind HTTP API.',
});
