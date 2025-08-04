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
		hint: `The URL of the PDF file to rotate. <a href="https://docs.pdf.co/integrations/n8n/rotate-pdf" target="_blank">See full guide</a>.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.RotatePdf],
			},
		},
	},
	{
		displayName: 'Rotation Mode',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Auto',
				value: 'auto',
				description: 'Automatically detect and fix rotation based on text analysis',
				hint: `Automatically detect and fix rotation based on text analysis`,
			},
			{
				name: 'Manual',
				value: 'manual',
				description: 'Manually specify rotation angle',
				hint: `Manually specify rotation angle`,
			},
		],
		default: 'manual',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotatePdf],
			},
		},
	},
	{
		displayName: 'Rotation Angle',
		name: 'angle',
		type: 'options',
		options: [
			{
				name: '90°',
				value: '90',
			},
			{
				name: '180°',
				value: '180',
			},
			{
				name: '270°',
				value: '270',
			},
		],
		default: '90',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotatePdf],
				mode: ['manual'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		description: 'Default: `0` (first page). Use ranges like `0,1-2,5,7-` (7- = from page 7 to end). Negative numbers count from end: `-2` = second-to-last page.',
		hint: 'Default: `0` (first page). Use ranges like `0,1-2,5,7-` (7- = from page 7 to end). Negative numbers count from end: `-2` = second-to-last page.',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotatePdf],
				mode: ['manual'],
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
				operation: [ActionConstants.RotatePdf],
			},
		},
		options: [
			{
				displayName: 'OCR Language Name or ID',
				name: 'lang',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '',
				placeholder: 'English',
				description: 'Specify the OCR language for text recognition in scanned PDFs. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
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
				description: 'The expiration time of the output link in minutes',
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
				hint: `Use JSON to customize PDF processing with options like output resolution, OCR settings, and more. Check our <a href="https://docs.pdf.co/integrations/n8n/rotate-pdf#custom-profiles" target="_blank">Custom Profile Guide</a> to see all available parameters for your current operation.`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputUrl = this.getNodeParameter('url', index) as string;
	const mode = this.getNodeParameter('mode', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	const body: IDataObject = {
		url: inputUrl,
		async: true,
		inline: true,
	};

	if (mode === 'manual') {
		const angle = this.getNodeParameter('angle', index) as string;
		body.angle = parseInt(angle);

		const pages = this.getNodeParameter('pages', index) as string;
		if (pages) {
			body.pages = pages;
		}
	}

	const lang = advancedOptions?.lang as string | undefined;
	if (lang) body.lang = lang;

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

	const endpoint = mode === 'auto' ? '/v1/pdf/edit/rotate/auto' : '/v1/pdf/edit/rotate';
	const responseData = await pdfcoApiRequestWithJobCheck.call(this, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}
