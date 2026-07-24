import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

const PDFCO_BACKEND_BASE_URL = 'https://api.backend.pdf.co';
const PDFCO_API_BASE_URL = 'https://api.pdf.co';
const PDFCO_OAUTH_CLIENT_ID = 'pdfco_7NT3JEinlEsg7rCiSYOnfyd3';

export class PdfcoOAuth2Api implements ICredentialType {
	name = 'pdfcoOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'PDF.co OAuth2 API';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'pkce',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: `${PDFCO_BACKEND_BASE_URL}/oauth/authorize`,
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: `${PDFCO_BACKEND_BASE_URL}/oauth/token`,
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'hidden',
			default: PDFCO_OAUTH_CLIENT_ID,
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'openid email profile api',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'User Info URL',
			name: 'userInfoUrl',
			type: 'hidden',
			default: `${PDFCO_BACKEND_BASE_URL}/oauth/userinfo`,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'hidden',
			default: PDFCO_API_BASE_URL,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			url: '={{$credentials?.userInfoUrl}}',
		},
	};
}
