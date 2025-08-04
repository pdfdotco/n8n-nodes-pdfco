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
		placeholder: 'https://example.com/document.pdf',
		hint: 'The URL of the PDF file to delete pages from. <a href="https://docs.pdf.co/integrations/n8n/delete-page-in-pdf" target="_blank">See full guide</a>.',
		displayOptions: {
			show: {
				operation: [ActionConstants.DeletePdfPages],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of page numbers to delete (e.g., "1,3,5-7")',
		hint: `Comma-separated list of page numbers to delete (e.g., "1,3,5-7")`,
		displayOptions: {
			show: {
				operation: [ActionConstants.DeletePdfPages],
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
				operation: [ActionConstants.DeletePdfPages],
			},
		},
		options: [
			{
				displayName: 'File Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Custom name for the output file. If empty, uses default file name.',
				hint: 'Custom name for the output file. If empty, uses default file name.',
			},
			{
				displayName: 'Webhook URL',
				name: 'callback',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/callback',
				description: 'The callback URL or Webhook used to receive the output data',
				hint: `The callback URL or Webhook used to receive the output data`,
			},
			{
				displayName: 'Output Links Expiration (In Minutes)',
				name: 'expiration',
				type: 'number',
				default: 60,
				description: 'The expiration time of the output link',
			},
			{
				displayName: 'HTTP Username',
				name: 'httpusername',
				type: 'string',
				default: '',
				description: 'The HTTP username if required to access source URL',
				hint: `The HTTP username if required to access source URL`,
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
				hint: `The HTTP password if required to access source URL`,
			},
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
				hint: `Use JSON to customize PDF processing with options like output resolution, OCR settings, and more. Check our <a href="https://docs.pdf.co/integrations/n8n/delete-page-in-pdf#custom-profiles" target="_blank">Custom Profile Guide</a> to see all available parameters for your current operation.`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputUrl = this.getNodeParameter('url', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	const body: IDataObject = {
		url: inputUrl,
		pages: pages,
		async: true,
		inline: true,
	};

	const fileName = advancedOptions?.name as string | undefined;
	if (fileName) body.name = fileName;

	const callback = advancedOptions?.callback as string | undefined;
	if (callback) body.callback = callback;

	const expiration = advancedOptions?.expiration as number | undefined;
	if (expiration) body.expiration = expiration;

	const httpusername = advancedOptions?.httpusername as string | undefined;
	if (httpusername) body.httpusername = httpusername;

	const httppassword = advancedOptions?.httppassword as string | undefined;
	if (httppassword) body.httppassword = httppassword;

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdfcoApiRequestWithJobCheck.call(this, '/v1/pdf/edit/delete-pages', body);
	return this.helpers.returnJsonArray(responseData);
}
