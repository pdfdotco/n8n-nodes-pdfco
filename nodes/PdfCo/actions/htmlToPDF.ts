import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdfcoApiRequestWithJobCheck,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Convert Type',
		name: 'convertType',
		type: 'options',
		options: [
			{
				name: 'URL to PDF',
				value: 'urlToPDF',
			},
			{
				name: 'HTML to PDF',
				value: 'htmlToPDF',
			},
			{
				name: 'HTML Template to PDF',
				value: 'htmlTemplateToPDF',
			},
		],
		default: 'urlToPDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlHtmlToPDF],
			},
		},
	},
	{
		displayName: 'Web Page URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://google.com',
		description: 'The URL of the page to convert to PDF',
		hint: `Enter the full web page URL (e.g., https://google.com) you want to convert to PDF.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlHtmlToPDF],
				convertType: ['urlToPDF'],
			},
		},
	},
	{
		displayName: 'Input HTML Code',
		name: 'html',
		type: 'string',
		typeOptions: {
			editor: 'htmlEditor',
		},
		required: true,
		default: '',
		placeholder: '<h1>Hello World</h1>',
		description: 'The HTML code to convert to PDF',
		hint: `Enter the HTML code to convert to PDF eg. &lt;h1&gt;Hello World&lt;/h1&gt;`,
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlHtmlToPDF],
				convertType: ['htmlToPDF'],
			},
		},
	},
	{
		displayName: 'HTML Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1',
		description: 'The ID of the HTML template to use',
		hint: `Enter the ID of the HTML template you created in PDF.co. This ID is used to generate the PDF layout. You can view your <a href="https://app.pdf.co/html-templates-tool/manager">HTML templates</a> here.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlHtmlToPDF],
				convertType: ['htmlTemplateToPDF'],
			},
		},
	},
	{
		displayName: 'Template Data (JSON/CSV)',
		name: 'templateData',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		placeholder: '',
		description: 'The data to use for the HTML template',
		hint: 'Provide the data to inject into the template. <br/>Use JSON (e.g. , {"invoice_id":"12345","total":"$999"}) or CSV (e.g. `invoice_id, total\\r\\n12345,$999`). <br/>Make sure keys match the template fields. You can view your <a href="https://app.pdf.co/templates/html">HTML templates here</a>.',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlHtmlToPDF],
				convertType: ['htmlTemplateToPDF'],
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
				operation: [ActionConstants.UrlHtmlToPDF],
			},
		},
		options: [
			{
				displayName: 'File Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Enter a custom file name (optional). Uses a default name if left empty.',
				hint: 'Enter a custom file name (optional). Uses a default name if left empty.',
			},
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				options: [
					{
						name: 'Portrait',
						value: 'portrait',
					},
					{
						name: 'Landscape',
						value: 'landscape',
					},
				],
				default: 'portrait',
			},
			{
				displayName: 'Paper Size',
				name: 'paperSize',
				type: 'options',
				options: [
					{ name: 'A0', value: 'a0' },
					{ name: 'A1', value: 'a1' },
					{ name: 'A2', value: 'a2' },
					{ name: 'A3', value: 'a3' },
					{ name: 'A4', value: 'a4' },
					{ name: 'A5', value: 'a5' },
					{ name: 'A6', value: 'a6' },
					{ name: 'Legal', value: 'legal' },
					{ name: 'Letter', value: 'letter' },
					{ name: 'Tabloid', value: 'tabloid' },
				],
				default: 'letter',
				hint: `Use Custom Paper Size to set your own dimensions. Do not use both Paper Size and Custom Paper Size together.`
			},
			{
				displayName: 'Custom Paper Size',
				name: 'custom',
				type: 'string',
				description: 'The custom paper size of the PDF',
				default: '',
				hint: `Enter the custom size (e.g., 200px 300px or 20in 30in). Supported units: px, mm, cm, in.`,
			},
			{
				displayName: 'Render Page Background',
				name: 'printBackground',
				type: 'boolean',
				default: true,
				description: 'Whether to render the page background',
			},
			{
				displayName: 'Do Not Wait For Full Load',
				name: 'doNotWaitFullLoad',
				type: 'boolean',
				default: false,
				description: 'Whether to do not wait for the full load',
			},
			{
				displayName: 'Margins',
				name: 'margins',
				type: 'string',
				default: '',
				description: 'The margins of the PDF',
				hint: `Set custom margins (e.g., 10px or 5mm 10mm 5mm 10mm). Format: {top} {right} {bottom} {left}. Units: px, mm, cm, or in.`,
			},
			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				options: [
					{ name: 'Print', value: 'print' },
					{ name: 'Screen', value: 'screen' },
					{ name: 'None', value: 'none' },
				],
				default: 'print',
				hint: `Controls which CSS styles are used. print for clean layout, screen to match website, none for default rendering.`
			},
			{
				displayName: 'Header',
				name: 'header',
				type: 'string',
				typeOptions: {
					editor: 'htmlEditor',
				},
				default: '',
				description: 'The header of the PDF',
				placeholder: '<h1>Header</h1>',
				hint: 'The header HTML code of the PDF (e.g. &lt;h1&gt;Header&lt;/h1&gt;)',
			},
			{
				displayName: 'Footer',
				name: 'footer',
				type: 'string',
				typeOptions: {
					editor: 'htmlEditor',
				},
				default: '',
				description: 'The footer of the PDF',
				placeholder: '<h1>Footer</h1>',
				hint: 'The footer HTML code of the PDF (e.g. &lt;h1&gt;Footer&lt;/h1&gt;)',
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
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
				description:
					'Use "JSON" to adjust custom properties. Review Profiles at https://docs.pdf.co/api-reference/pdf-from-html/convert to set extra options for API calls and may be specific to certain APIs.',
				hint: `Use "JSON" to adjust custom properties. Review <a href="https://docs.pdf.co/api-reference/pdf-from-html/convert">Profiles documentation</a> to set extra options for API calls and may be specific to certain APIs.`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// Build body based on option selected
	const convertType = this.getNodeParameter('convertType', index) as string;

	// Choose endpoint based on convertType flag
	const endpoint =
		convertType === 'urlToPDF' ? `/v1/pdf/convert/from/url` : `/v1/pdf/convert/from/html`;

	// Build the payload object; add fileName and profiles only if provided
	const body: IDataObject = { async: true };

	if (convertType === 'htmlTemplateToPDF') {
		// Retrieve the "templateId" parameter.
		const templateId = this.getNodeParameter('templateId', index) as string | undefined;
		if (templateId) body.templateId = templateId;

		// Retrieve the "templateData" parameter.
		const templateData = this.getNodeParameter('templateData', index) as string | undefined;
		if (templateData) body.templateData = templateData;
	} else if (convertType === 'htmlToPDF') {
		// Retrieve the "html" parameter.
		const html = this.getNodeParameter('html', index) as string | undefined;
		if (html) body.html = html;
	} else {
		// Retrieve the "url" parameter.
		const inputUrl = this.getNodeParameter('url', index) as string | undefined;
		if (inputUrl) body.url = inputUrl;
	}

	// Advanced Options
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	const fileName = advancedOptions?.name as string | undefined;
	if (fileName) body.name = fileName;

	const orientation = advancedOptions?.orientation as string | undefined;
	if (orientation) body.orientation = orientation;

	const paperSize = advancedOptions?.paperSize as string | undefined;
	if (paperSize) body.paperSize = paperSize;

	const custom = advancedOptions?.custom as string | undefined;
	if (custom) body.paperSize = custom;

	const printBackground = advancedOptions?.printBackground as boolean | false;
	body.printBackground = printBackground;

	const doNotWaitFullLoad = advancedOptions?.doNotWaitFullLoad as boolean | false;
	body.DoNotWaitFullLoad = doNotWaitFullLoad;

	const margins = advancedOptions?.margins as string | undefined;
	if (margins) body.margins = margins;

	const mediaType = advancedOptions?.mediaType as string | undefined;
	if (mediaType) body.mediaType = mediaType;

	const header = advancedOptions?.header as string | undefined;
	if (header) body.header = header;

	const footer = advancedOptions?.footer as string | undefined;
	if (footer) body.footer = footer;

	const callback = advancedOptions?.callback as string | undefined;
	if (callback) body.callback = callback;

	const expiration = advancedOptions?.expiration as number | undefined;
	if (expiration) body.expiration = expiration;

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize the profiles (if present)
	sanitizeProfiles(body);

	// Make the API request and return the response in the expected format
	const responseData = await pdfcoApiRequestWithJobCheck.call(this, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}
