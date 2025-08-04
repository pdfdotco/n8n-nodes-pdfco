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
		hint: `Source file URL of the PDF file to add security to or remove security from. <a href="https://docs.pdf.co/integrations/n8n/pdf-add-remove-security" target="_blank">See full guide</a>.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
			},
		},
	},
	{
		displayName: 'Operation Mode',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Add Security',
				value: 'add_security',
			},
			{
				name: 'Remove Security',
				value: 'remove_security',
			},
		],
		default: 'add_security',
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
			},
		},
	},
	{
		displayName: 'Owner Password',
		name: 'ownerPassword',
		type: 'string',
		typeOptions: {
			password: true,
		},
		description: 'The main owner password that is used for document encryption and for setting/removing restrictions',
		hint: 'The main owner password that is used for document encryption and for setting/removing restrictions',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
				mode: ['add_security'],
			},
		},
	},
	{
		displayName: 'User Password',
		name: 'userPassword',
		type: 'string',
		typeOptions: {
			password: true,
		},
		description: 'The optional user password will be asked for viewing and printing document',
		hint: 'The optional user password will be asked for viewing and printing document',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
				mode: ['add_security'],
			},
		},
	},
	{
		displayName: 'Owner/User Password',
		name: 'passwordForRemoveSecurity',
		type: 'string',
		required: true,
		typeOptions: {
			password: true,
		},
		description: 'The password for the owner/user',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
				mode: ['remove_security'],
			},
		},
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptionsAddSecurity',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
				mode: ['add_security'],
			},
		},
		options: [
			{
				displayName: 'Encryption Algorithm',
				name: 'encryptionAlgorithm',
				type: 'options',
				options: [
					{
						name: 'AES 128bit',
						value: 'AES_128bit',
					},
					{
						name: 'AES 256bit',
						value: 'AES_256bit',
					},
					{
						name: 'RC4 40bit',
						value: 'RC4_40bit',
					},
					{
						name: 'RC4 128bit',
						value: 'RC4_128bit',
					},
				],
				default: 'AES_128bit',
			},
			{
				displayName: 'Allow Accessibility Support',
				name: 'allowAccessibilitySupport',
				description: 'Whether to allow accessibility support',
				hint: 'Allow content extraction for accessibility. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Allow Document Assembly',
				name: 'allowAssemblyDocument',
				description: 'Whether to allow document assembly',
				hint: 'Allow document assembly. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Allow Printing',
				name: 'allowPrintDocument',
				description: 'Whether to allow printing',
				hint: 'Allow printing. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Allow Form Filling',
				name: 'allowFillForms',
				description: 'Whether to allow form filling',
				hint: 'Allow form filling. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Allow Document Modification',
				name: 'allowModifyDocument',
				description: 'Whether to allow document modification',
				hint: 'Allow document modification. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Allow Content Extraction',
				name: 'allowContentExtraction',
				description: 'Whether to allow content extraction',
				hint: 'Allow content extraction. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Allow Annotation Modification',
				name: 'allowModifyAnnotations',
				description: 'Whether to allow annotation modification',
				hint: 'Allow annotation modification. Applies only if a User password is set',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Print Quality',
				name: 'printQuality',
				type: 'options',
				options: [
					{
						name: 'High Resolution',
						value: 'HighResolution',
					},
					{
						name: 'Low Resolution',
						value: 'LowResolution',
					},
				],
				default: 'HighResolution',
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
				description: 'The expiration time of the output link',
			},
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
				hint: `Use JSON to customize PDF processing with options like output resolution, OCR settings, and more. Check our <a href="https://docs.pdf.co/integrations/n8n/pdf-add-remove-security#custom-profiles" target="_blank">Custom Profile Guide</a> to see all available parameters for your current operation.`,
			},
		],
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptionsRemoveSecurity',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.PDFSecurity],
				mode: ['remove_security'],
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
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
				hint: `Use JSON to customize PDF processing with options like output resolution, OCR settings, and more. Check our <a href="https://docs.pdf.co/integrations/n8n/pdf-add-remove-security#custom-profiles" target="_blank">Custom Profile Guide</a> to see all available parameters for your current operation.`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputUrl = this.getNodeParameter('url', index) as string;
	const mode = this.getNodeParameter('mode', index) as string;

	const body: IDataObject = {
		url: inputUrl,
		async: true,
		inline: true,
	};

	if (mode === 'add_security') {
		const ownerPassword = this.getNodeParameter('ownerPassword', index) as string;
		body.ownerPassword = ownerPassword;

		const userPassword = this.getNodeParameter('userPassword', index) as string;
		body.userPassword = userPassword;

		// Advanced Options
		const advancedOptions = this.getNodeParameter(
			'advancedOptionsAddSecurity',
			index,
		) as IDataObject;

		const encryptionAlgorithm = advancedOptions?.encryptionAlgorithm as string | undefined;
		if (encryptionAlgorithm) body.encryptionAlgorithm = encryptionAlgorithm;

		const allowAccessibilitySupport = advancedOptions?.allowAccessibilitySupport as
			| boolean
			| undefined;
		if (allowAccessibilitySupport !== undefined) body.allowAccessibilitySupport = allowAccessibilitySupport;

		const allowAssemblyDocument = advancedOptions?.allowAssemblyDocument as boolean | undefined;
		if (allowAssemblyDocument !== undefined) body.allowAssemblyDocument = allowAssemblyDocument;

		const allowPrintDocument = advancedOptions?.allowPrintDocument as boolean | undefined;
		if (allowPrintDocument !== undefined) body.allowPrintDocument = allowPrintDocument;

		const allowFillForms = advancedOptions?.allowFillForms as boolean | undefined;
		if (allowFillForms !== undefined) body.allowFillForms = allowFillForms;

		const allowModifyDocument = advancedOptions?.allowModifyDocument as boolean | undefined;
		if (allowModifyDocument !== undefined) body.allowModifyDocument = allowModifyDocument;

		const allowContentExtraction = advancedOptions?.allowContentExtraction as boolean | undefined;
		if (allowContentExtraction !== undefined) body.allowContentExtraction = allowContentExtraction;

		const allowModifyAnnotations = advancedOptions?.allowModifyAnnotations as
			| boolean
			| undefined;
		if (allowModifyAnnotations !== undefined) body.allowModifyAnnotations = allowModifyAnnotations;

		const printQuality = advancedOptions?.printQuality as string | undefined;
		if (printQuality !== undefined) body.printQuality = printQuality;

		const fileName = advancedOptions?.name as string | undefined;
		if (fileName) body.name = fileName;

		const callback = advancedOptions?.callback as string | undefined;
		if (callback) body.callback = callback;

		const expiration = advancedOptions?.expiration as number | undefined;
		if (expiration) body.expiration = expiration;

		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;
	} else {
		const passwordForRemoveSecurity = this.getNodeParameter(
			'passwordForRemoveSecurity',
			index,
		) as string;
		body.password = passwordForRemoveSecurity;

		// Advanced Options
		const advancedOptions = this.getNodeParameter(
			'advancedOptionsRemoveSecurity',
			index,
		) as IDataObject;

		const fileName = advancedOptions?.name as string | undefined;
		if (fileName) body.name = fileName;

		const callback = advancedOptions?.callback as string | undefined;
		if (callback) body.callback = callback;

		const expiration = advancedOptions?.expiration as number | undefined;
		if (expiration) body.expiration = expiration;

		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;
	}

	// Sanitize the profiles (if present)
	sanitizeProfiles(body);

	// Choose endpoint based on mode
	const endpoint = mode === 'add_security' ? '/v1/pdf/security/add' : '/v1/pdf/security/remove';

	// Make the API request and return the response in the expected format
	const responseData = await pdfcoApiRequestWithJobCheck.call(this, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}
