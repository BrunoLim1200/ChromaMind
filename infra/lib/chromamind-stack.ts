import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

/**
 * ChromaMind production stack.
 *
 *   CloudFront (HTTPS)
 *     ├─ default            -> S3 (private, OAC)         : Angular SPA
 *     └─ /api/*             -> HTTP API Gateway -> Lambda : FastAPI (Mangum)
 *
 * The palette API is a pure function of its query string, so GET responses are
 * cached at CloudFront (see ApiCachePolicy). The frontend build is uploaded to
 * the bucket out-of-band (CI `aws s3 sync` — see .github/workflows/deploy.yml),
 * which keeps `cdk synth` independent of a prior `ng build`.
 */
export class ChromaMindStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const backendDir = path.join(__dirname, '..', '..', 'backend');

    // --- Lambda: FastAPI wrapped by Mangum (app/main.py -> `handler`) ---
    // PythonFunction bundles requirements.txt via Docker at synth time.
    const paletteFn = new PythonFunction(this, 'PaletteFn', {
      entry: backendDir,
      index: 'app/main.py',
      handler: 'handler',
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        // Same-origin in production (SPA + API share the CloudFront domain), so
        // CORS is effectively unused; set this only for a split-domain setup.
        CORS_ORIGINS: '',
      },
    });

    // --- HTTP API Gateway (cheaper than REST API; native throttling) ---
    const httpApi = new HttpApi(this, 'HttpApi', {
      defaultIntegration: new HttpLambdaIntegration('PaletteIntegration', paletteFn),
    });

    // Account/route-level throttling as a first line of abuse defense.
    const defaultStage = httpApi.defaultStage!.node.defaultChild as cdk.aws_apigatewayv2.CfnStage;
    defaultStage.defaultRouteSettings = {
      throttlingRateLimit: 20,
      throttlingBurstLimit: 40,
    };

    // apiEndpoint = https://{id}.execute-api.{region}.amazonaws.com -> take the host.
    const apiDomain = cdk.Fn.select(2, cdk.Fn.split('/', httpApi.apiEndpoint));

    // --- S3 bucket for the Angular build (private; served only via CloudFront) ---
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      // Portfolio project: allow teardown. Harden (RETAIN) for a real product.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // --- Cache policy for the deterministic GET palette API ---
    const apiCachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
      comment: 'Cache palette GET responses keyed on the full query string',
      minTtl: cdk.Duration.seconds(0),
      defaultTtl: cdk.Duration.hours(24),
      maxTtl: cdk.Duration.days(365),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // --- CloudFront distribution ---
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'ChromaMind SPA + API',
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        'api/*': {
          origin: new origins.HttpOrigin(apiDomain, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: apiCachePolicy,
          // Forward the query string to the origin but strip the viewer Host
          // header (execute-api rejects a mismatched Host).
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      errorResponses: [
        // SPA client-side routing: serve index.html for unknown paths.
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'ApiEndpoint', { value: httpApi.apiEndpoint });
    new cdk.CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
  }
}
