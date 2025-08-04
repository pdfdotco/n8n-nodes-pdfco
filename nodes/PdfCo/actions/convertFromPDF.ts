import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdfcoApiRequestWithJobCheck,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Common field definitions to reduce duplication
const commonFields = {
	name: {
		displayName: 'File Name',
		name: 'name',
		type: 'string' as const,
		default: '',
		description: 'Custom name for the output file. If empty, uses default file name.',
		hint: 'Custom name for the output file. If empty, uses default file name.',
	},
	pages: {
		displayName: 'Pages',
		name: 'pages',
		type: 'string' as const,
		default: '',
		placeholder: '0',
		hint: `Comma-separated list of page indices (or ranges) to process. Leave empty for all pages. First page is 0 (zero). Example: '0,1-2,5-'.`,
	},
	inline: {
		displayName: 'Inline',
		name: 'inline',
		type: 'boolean' as const,
		default: true,
		description: 'Whether to return the output in the response',
		hint: `Whether to return the output in the response`,
	},
	rect: {
		displayName: 'Extraction Region',
		name: 'rect',
		type: 'string' as const,
		default: '',
		placeholder: '51.8, 114.8, 235.5, 204.0',
		description: 'The region of the document to extract',
		hint: `Specify the region to extract in the format: 'x, y, width, height' (e.g. '51.8, 114.8, 235.5, 204.0'). Use <a href="https://app.pdf.co/pdf-edit-add-helper">PDF Inspector</a> to measure coordinates.`,
	},
	callback: {
		displayName: 'Webhook URL',
		name: 'callback',
		type: 'string' as const,
		default: '',
		placeholder: 'https://example.com/callback',
		description: 'The callback URL or Webhook used to receive the output data',
		hint: `The callback URL or Webhook used to receive the output data`,
	},
	expiration: {
		displayName: 'Output Links Expiration (In Minutes)',
		name: 'expiration',
		type: 'number' as const,
		default: 60,
		description: 'The expiration time of the output links',
	},
	httpusername: {
		displayName: 'HTTP Username',
		name: 'httpusername',
		type: 'string' as const,
		default: '',
		description: 'The HTTP username if required to access source URL',
		hint: `The HTTP username if required to access source URL`,
	},
	httppassword: {
		displayName: 'HTTP Password',
		name: 'httppassword',
		type: 'string' as const,
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'The HTTP password if required to access source URL',
		hint: `The HTTP password if required to access source URL`,
	},
	profiles: {
		displayName: 'Custom Profiles',
		name: 'profiles',
		type: 'string' as const,
		default: '',
		placeholder: `{ 'outputDataFormat': 'base64' }`,
		hint: `Use JSON to customize PDF processing with options like output resolution, OCR settings, and more. Check our <a href="https://docs.pdf.co/integrations/n8n/convert-from-pdf#custom-profiles" target="_blank">Custom Profile Guide</a> to see all available parameters for your current operation.`,
	},
	lang: {
		displayName: 'OCR Language Name or ID',
		name: 'lang',
		type: 'options' as const,
		typeOptions: {
			loadOptionsMethod: 'getLanguages',
		},
		default: '',
		placeholder: 'English',
		description:
			'The language of the OCR for Scanned Documents. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.'
	},
	lineGrouping: {
		displayName: 'Line Grouping',
		name: 'lineGrouping',
		type: 'options' as const,
		options: [
			{
				name: 'Group by Rows',
				value: '1',
				description: 'Groups rows by checking if cells can be merged with the next row'
			},
			{
				name: 'Group by Columns',
				value: '2',
				description: 'Groups cells within the same column across rows'
			},
			{
				name: 'Join Orphaned Rows',
				value: '3',
				description: 'Joins orphaned rows to previous rows when no separator exists'
			},
		],
		default: '1',
		hint: `Controls how lines of text are grouped within table cells when extracting data from a PDF.`,
	},
	unwrap: {
		displayName: 'Unwrap',
		name: 'unwrap',
		type: 'boolean' as const,
		default: false,
		description:
			'Whether to unwrap lines into a single line within table cells when lineGrouping provided',
		hint: `Whether to unwrap lines into a single line within table cells when lineGrouping provided`,
	},
};

// Helper function to create advanced options collection
function createAdvancedOptions(name: string, convertTypes: string[], fields: string[]): INodeProperties {
	return {
		displayName: 'Advanced Options',
		name,
		type: 'collection' as const,
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
				convertType: convertTypes,
			},
		},
		options: fields.map(fieldName => commonFields[fieldName as keyof typeof commonFields]),
	};
}

// Helper function to process common parameters
function processCommonParameters(advancedOptions: IDataObject, body: IDataObject, includeFields: string[]) {
	const fieldMappings: Record<string, string> = {
		pages: 'pages',
		name: 'name',
		inline: 'inline',
		rect: 'rect',
		callback: 'callback',
		expiration: 'expiration',
		httpusername: 'httpusername',
		httppassword: 'httppassword',
		profiles: 'profiles',
		lang: 'lang',
		lineGrouping: 'lineGrouping',
		unwrap: 'unwrap',
	};

	includeFields.forEach(field => {
		const paramName = fieldMappings[field];
		if (paramName) {
			const value = advancedOptions?.[field];
			if (value !== undefined && value !== '') {
				if (field === 'lineGrouping' && value) {
					body[paramName] = value;
					// Handle unwrap when lineGrouping is present
					const unwrapValue = advancedOptions?.unwrap;
					if (unwrapValue !== undefined) {
						body.unwrap = unwrapValue;
					}
				} else {
					body[paramName] = value;
				}
			}
		}
	});
}

export const description: INodeProperties[] = [
	{
		displayName: 'PDF URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/invoice.pdf',
		hint: `Source file URL of the PDF file to convert. <a href="https://docs.pdf.co/integrations/n8n/convert-from-pdf" target="_blank">See full guide</a>.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
	},
	{
		displayName: 'Convert Type',
		name: 'convertType',
		type: 'options',
		options: [
			{
				name: 'PDF to CSV',
				value: 'toCsv',
			},
			{
				name: 'PDF to HTML',
				value: 'toHtml',
			},
			{
				name: 'PDF to JPG',
				value: 'toJpg',
			},
			{
				name: 'PDF to JSON (AI-Powered)',
				value: 'toJsonMeta',
				description: 'AI-powered PDF to JSON conversion with text styles and metadata detection'
			},
			{
				name: 'PDF to JSON (Simple)',
				value: 'toJson2',
				description: 'Converts PDF to JSON with basic text, table, and image extraction'
			},
			{
				name: 'PDF to PNG',
				value: 'toPng',
			},
			{
				name: 'PDF to Text',
				value: 'toText',
			},
			{
				name: 'PDF to Text (No Layout & Fast)',
				value: 'toTextSimple',
			},
			{
				name: 'PDF to TIFF',
				value: 'toTiff',
			},
			{
				name: 'PDF to WEBP',
				value: 'toWebp',
			},
			{
				name: 'PDF to XLS',
				value: 'toXls',
			},
			{
				name: 'PDF to XLSX',
				value: 'toXlsx',
			},
			{
				name: 'PDF to XML',
				value: 'toXml',
			},
		],
		default: 'toText',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
	},
	// Standard advanced options (for most conversion types)
	createAdvancedOptions('advancedOptions', ['toCsv', 'toHtml', 'toJson', 'toJsonMeta', 'toJson2', 'toText', 'toXml'],
		['name', 'pages', 'lang', 'rect', 'callback', 'expiration', 'inline', 'lineGrouping', 'unwrap', 'httpusername', 'httppassword', 'profiles']),
	// Excel-specific advanced options
	createAdvancedOptions('advancedOptions_Excel', ['toXls', 'toXlsx'],
		['name', 'pages', 'lineGrouping', 'unwrap', 'lang', 'rect', 'callback', 'expiration', 'httpusername', 'httppassword', 'profiles']),
	// Image-specific advanced options
	createAdvancedOptions('advancedOptions_Image', ['toJpg', 'toPng', 'toWebp'],
		['name', 'pages', 'inline', 'rect', 'callback', 'expiration', 'httpusername', 'httppassword', 'profiles']),
	// TIFF-specific advanced options
	createAdvancedOptions('advancedOptions_Tiff', ['toTiff'],
		['name', 'pages', 'rect', 'callback', 'expiration', 'httpusername', 'httppassword', 'profiles']),
	// Text Simple advanced options
	createAdvancedOptions('advancedOptions_TextSimple', ['toTextSimple'],
		['name', 'pages', 'inline', 'callback', 'expiration', 'httpusername', 'httppassword', 'profiles']),
];

// Endpoint mapping
const endpointMap: Record<string, string> = {
	toCsv: '/v1/pdf/convert/to/csv',
	toHtml: '/v1/pdf/convert/to/html',
	toJpg: '/v1/pdf/convert/to/jpg',
	toJson: '/v1/pdf/convert/to/json',
	toJsonMeta: '/v1/pdf/convert/to/json-meta',
	toJson2: '/v1/pdf/convert/to/json2',
	toPng: '/v1/pdf/convert/to/png',
	toText: '/v1/pdf/convert/to/text',
	toTextSimple: '/v1/pdf/convert/to/text-simple',
	toTiff: '/v1/pdf/convert/to/tiff',
	toXls: '/v1/pdf/convert/to/xls',
	toXlsx: '/v1/pdf/convert/to/xlsx',
	toXml: '/v1/pdf/convert/to/xml',
	toWebp: '/v1/pdf/convert/to/webp',
};

// Parameter configuration for each conversion type
const parameterConfig: Record<string, { paramName: string; fields: string[] }> = {
	toJpg: { paramName: 'advancedOptions_Image', fields: ['pages', 'name', 'rect', 'callback', 'expiration', 'inline', 'httpusername', 'httppassword', 'profiles'] },
	toPng: { paramName: 'advancedOptions_Image', fields: ['pages', 'name', 'rect', 'callback', 'expiration', 'inline', 'httpusername', 'httppassword', 'profiles'] },
	toWebp: { paramName: 'advancedOptions_Image', fields: ['pages', 'name', 'rect', 'callback', 'expiration', 'inline', 'httpusername', 'httppassword', 'profiles'] },
	toTiff: { paramName: 'advancedOptions_Tiff', fields: ['pages', 'name', 'rect', 'callback', 'expiration', 'httpusername', 'httppassword', 'profiles'] },
	toTextSimple: { paramName: 'advancedOptions_TextSimple', fields: ['pages', 'name', 'callback', 'expiration', 'inline', 'httpusername', 'httppassword', 'profiles'] },
	toXls: { paramName: 'advancedOptions_Excel', fields: ['pages', 'name', 'lang', 'rect', 'callback', 'expiration', 'lineGrouping', 'unwrap', 'httpusername', 'httppassword', 'profiles'] },
	toXlsx: { paramName: 'advancedOptions_Excel', fields: ['pages', 'name', 'lang', 'rect', 'callback', 'expiration', 'lineGrouping', 'unwrap', 'httpusername', 'httppassword', 'profiles'] },
};

export async function execute(this: IExecuteFunctions, index: number) {
	// Build body based on option selected
	const convertType = this.getNodeParameter('convertType', index) as string;

	// Build the payload object
	const body: IDataObject = { async: true, inline: true };

	// Retrieve the "url" parameter.
	const inputUrl = this.getNodeParameter('url', index) as string | undefined;
	if (inputUrl) body.url = inputUrl;

	// Get endpoint from mapping
	const endpoint = endpointMap[convertType];
	if (!endpoint) {
		throw new Error(`Unsupported conversion type: ${convertType}`);
	}

	// Process parameters based on conversion type
	if (parameterConfig[convertType]) {
		const config = parameterConfig[convertType];
		const advancedOptions = this.getNodeParameter(config.paramName, index) as IDataObject;
		processCommonParameters(advancedOptions, body, config.fields);
	} else {
		// Default processing for other conversion types
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
		processCommonParameters(advancedOptions, body, ['pages', 'name', 'lang', 'rect', 'callback', 'expiration', 'inline', 'lineGrouping', 'unwrap', 'httpusername', 'httppassword', 'profiles']);
	}

	// Sanitize the profiles (if present)
	sanitizeProfiles(body);

	// Make the API request and return the response in the expected format
	const responseData = await pdfcoApiRequestWithJobCheck.call(this, endpoint, body);

	// If inline parameter specified and true, then fetch object from URL and add it to responseData with body as key
	if (body.inline && responseData.url
			&& convertType !== 'toTiff' && convertType !== 'toXls' && convertType !== 'toXlsx') {
		const response = await this.helpers.request(responseData.url);

		if(convertType === 'toJpg' || convertType === 'toPng' || convertType === 'toWebp') {
			responseData.body = JSON.parse(response);
		} else {
			responseData.body = response;
		}
	}

	return this.helpers.returnJsonArray(responseData);
}
