const API_GATEWAY = {
  NAME: 'swe599Api',
  DESCRIPTION: 'SWE599 REST API',
  STAGE: 'dev',
  ALLOWED_METHODS: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  ALLOWED_ORIGINS: 'http://localhost:3000',
} as const;

export {API_GATEWAY};
