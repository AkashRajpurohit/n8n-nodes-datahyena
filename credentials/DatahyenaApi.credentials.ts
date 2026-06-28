import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class DatahyenaApi implements ICredentialType {
  name = 'datahyenaApi';

  displayName = 'Datahyena API';

  // eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-miscased
  documentationUrl = 'https://datahyena.com/docs';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Datahyena API key. Free (50 credits, no card) at https://app.datahyena.com/register',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{ $credentials.apiKey }}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.datahyena.com/v1',
      url: '/funding-events',
      qs: { limit: 1 },
    },
  };
}
