// Production environment. In production the SPA and the API are served from the
// same CloudFront domain, so the API is reached via a same-origin relative path
// (CloudFront routes /api/* to the API Gateway origin).
export const environment = {
  production: true,
  apiUrl: '/api/v1'
};
