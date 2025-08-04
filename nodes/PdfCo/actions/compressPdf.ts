import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdfcoApiRequestWithJobCheck,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'PDF URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/invoice.pdf',
		hint: `Enter source file URL of the PDF file to compress. <a href="https://docs.pdf.co/integrations/n8n/compress-pdf" target="_blank">See full guide</a>.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressPdf],
			},
		},
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressPdf],
			},
		},
		options: [
			{
				displayName: 'File Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the output file',
				hint: `Enter the name of the output file. If not specified, the original file name is used.`,
			},
			{
				displayName: 'Webhook URL',
				name: 'callback',
				type: 'string', // You can also use "url" if you want built-in URL validation.
				default: '',
				placeholder: 'https://example.com/callback',
				description: 'The callback URL or Webhook used to receive the output data',
				hint: 'The callback URL or Webhook used to receive the output data.',
			},
			{
				displayName: 'Output Links Expiration (In Minutes)',
				name: 'expiration',
				type: 'number',
				default: 60,
				description: 'The expiration time of the output link',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'The password of the PDF file',
				hint: 'The password of the password-protected PDF file',
			},
			{
				displayName: 'HTTP Username',
				name: 'httpusername',
				type: 'string',
				default: '',
				description: 'The HTTP username if required to access source URL',
				hint: 'The HTTP username if required to access source URL',
			},
			{
				displayName: 'HTTP Password',
				name: 'httppassword',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'The HTTP password if required to access source URL',
				hint: 'The HTTP password if required to access source URL',
			},
			{
				displayName: 'Custom Compression Configuration',
				name: 'config',
				type: 'json',
				default: '',
				description: 'The custom compression configuration to use',
				hint: 'Define custom compression configuration. See PDF.co <a href="https://docs.pdf.co/integrations/n8n/compress-pdf#custom-compression-configuration" target="_blank">PDF Compression Docs</a> for supported options.',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// Retrieve the "url" parameter.
	const inputUrl = this.getNodeParameter('url', index) as string;

	const endpoint =  `/v2/pdf/compress`;

	// Build the payload object; add fileName and profiles only if provided
	const body: IDataObject = { url: inputUrl, async: true, inline: true };

	// Advanced Options
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	const name = advancedOptions?.name as string | undefined;
	if (name) body.name = name;

	const callback = advancedOptions?.callback as string | undefined;
	if (callback) body.callback = callback;

	const expiration = advancedOptions?.expiration as number | undefined;
	if (expiration) body.expiration = expiration;

	const password = advancedOptions?.password as string | undefined;
	if (password) body.password = password;

	const httpusername = advancedOptions?.httpusername as string | undefined;
	if (httpusername) body.httpusername = httpusername;

	const httppassword = advancedOptions?.httppassword as string | undefined;
	if (httppassword) body.httppassword = httppassword;

	const config = advancedOptions?.config as string | undefined;
	if (config) body.profiles = config;

	// Sanitize the profiles (if present)
	sanitizeProfiles(body);

	if(body.profiles) {
		body.config = JSON.parse(body.profiles as string);
		delete body.profiles;
	}

	// Make the API request and return the response in the expected format
	const responseData = await pdfcoApiRequestWithJobCheck.call(this, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}
