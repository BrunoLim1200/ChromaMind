# ChromaMind Infrastructure (AWS CDK, TypeScript)

Provisions the production stack:

```
CloudFront (HTTPS)
  ├─ default   -> S3 (private, Origin Access Control)   : Angular SPA
  └─ /api/*    -> HTTP API Gateway -> Lambda             : FastAPI via Mangum
```

The palette API is a pure function of its query string, so GET responses are
cached at CloudFront. The frontend build is uploaded to the S3 bucket by CI
(`aws s3 sync`), not by CDK, so `cdk synth` never depends on a prior `ng build`.

## Prerequisites

- Node.js 20+
- **Docker** — `PythonFunction` bundles the Lambda's `requirements.txt` in a
  container at synth/deploy time.
- AWS credentials for your account (`aws configure` or SSO), region **us-east-1**
  (CloudFront ACM certs must live there; the stack is pinned to it).

## First-time setup

```bash
cd infra
npm install
npx cdk bootstrap          # one-time per account/region
```

## Deploy

```bash
npm run synth              # inspect the generated CloudFormation
npm run deploy             # cdk deploy
```

After the first deploy, upload the frontend (CI does this automatically):

```bash
cd ../frontend && npm ci && npm run build
aws s3 sync dist/ChromaMind "s3://$SITE_BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*'
```

`SITE_BUCKET` (`SiteBucketName`) and `DIST_ID` (`DistributionId`) are printed as
stack outputs, alongside `DistributionUrl` and `ApiEndpoint`.

## Verify

```bash
curl -s "$DistributionUrl/api/v1/palette/generate-palette?base_color=%23FF0000&harmony_type=triadic&count=5"
# second call should show: x-cache: Hit from cloudfront
curl -sI "$DistributionUrl/api/v1/palette/generate-palette?base_color=%23FF0000&harmony_type=triadic&count=5" | grep -i x-cache
```

## Teardown

```bash
npm run deploy -- --destroy   # or: npx cdk destroy
```

## Custom domain (Phase 4, optional)

Add an ACM certificate (us-east-1) + `domainNames`/`certificate` on the
`Distribution`, and a Route53 `ARecord` alias to the distribution.
