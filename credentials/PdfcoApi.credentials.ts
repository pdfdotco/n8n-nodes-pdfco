import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { PDFCO_CONSTANTS } from '../nodes/PdfCo/constants';

export class PdfcoApi implements ICredentialType {
	name = 'pdfcoApi';
	displayName = 'PDF.co API';
	//documentationUrl = '<your-docs-url>';
	properties: INodeProperties[] = [
		{
			displayName: 'Enter your PDF.co API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			hint: `To get your PDF.co API key please <a href="https://app.pdf.co/signup?utm_source=n8n&utm_medium=sign-up">click here to create your account</a>`,
		}
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials?.apiKey}}',
				'user-agent': PDFCO_CONSTANTS.USER_AGENT,
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			url: `${PDFCO_CONSTANTS.BASE_URL}/v1/account/credit/balance`,
		},
	};
}
