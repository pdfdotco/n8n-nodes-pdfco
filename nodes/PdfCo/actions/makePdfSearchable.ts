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
		hint: 'Source file URL of the PDF file to make searchable or unsearchable. <a href="https://docs.pdf.co/integrations/n8n/make-pdf-searchable-or-unsearchable" target="_blank">See full guide</a>.',
		displayOptions: {
			show: {
				operation: [ActionConstants.MakePdfSearchable],
			},
		},
	},
	{
		displayName: 'Make PDF Searchable or Unsearchable',
		name: 'searchableOptions',
		type: 'options',
		default: 'makeSearchable',
		options: [
			{
				name: 'Make PDF Searchable',
				value: 'makeSearchable',
			},
			{
				name: 'Make PDF Unsearchable',
				value: 'makeUnsearchable',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.MakePdfSearchable],
			},
		},
	},
	{
		displayName: 'OCR Language Name or ID',
		name: 'lang',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLanguages',
		},
		default: '',
		placeholder: 'English',
		description: 'Specify the language for OCR when extracting text from scanned documents. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: [ActionConstants.MakePdfSearchable],
				searchableOptions: ['makeSearchable'],
			},
		}
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.MakePdfSearchable],
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
				displayName: 'Pages',
				name: 'pages',
				type: 'string',
				description: 'Default: `0` (first page). Use ranges like `0,1-2,5,7-` (7- = from page 7 to end). Negative numbers count from end: `-2` = second-to-last page.',
				default: '',
				placeholder: '0',
				hint: 'Default: `0` (first page). Use ranges like `0,1-2,5,7-` (7- = from page 7 to end). Negative numbers count from end: `-2` = second-to-last page.',
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
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'The password of the password-protected PDF file',
				hint: `The password of the password-protected PDF file`,
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
				hint: `Use JSON to customize PDF processing with options like output resolution, OCR settings, and more. Check our <a href="https://docs.pdf.co/integrations/n8n/make-pdf-searchable-or-unsearchable#custom-profiles" target="_blank">Custom Profile Guide</a> to see all available parameters for your current operation.`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const url = this.getNodeParameter('url', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const searchableOptions = this.getNodeParameter('searchableOptions', index) as string;

	const body: IDataObject = {
		url,
		async: true,
	};

	let apiUrl = '/v1/pdf/makesearchable';
	if (searchableOptions === 'makeSearchable') {
		const lang = this.getNodeParameter('lang', index) as string;
		body.lang = lang;
	} else {
		apiUrl = '/v1/pdf/makeunsearchable';
	}

	// Add advanced options
	const fileName = advancedOptions?.name as string | undefined;
	if (fileName) body.name = fileName;

	const pages = advancedOptions?.pages as string | undefined;
	if (pages) body.pages = pages;

	const callback = advancedOptions?.callback as string | undefined;
	if (callback) body.callback = callback;

	const expiration = advancedOptions?.expiration as number | undefined;
	if (expiration) body.expiration = expiration;

	const httpusername = advancedOptions?.httpusername as string | undefined;
	if (httpusername) body.httpusername = httpusername;

	const httppassword = advancedOptions?.httppassword as string | undefined;
	if (httppassword) body.httppassword = httppassword;

	const password = advancedOptions?.password as string | undefined;
	if (password) body.password = password;

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdfcoApiRequestWithJobCheck.call(this, apiUrl, body);
	return this.helpers.returnJsonArray(responseData);
}
