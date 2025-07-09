import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { pdfcoApiRequestWithJobCheck, ActionConstants } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'PDF URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/invoice.pdf',
		description: 'URL to the source PDF file',
		hint: `Enter the URL of the invoice you want to extract. Make sure it's accessible and contains only one invoice. Use our <b>PDF Split</b> module if it includes multiple invoices.`,
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
			},
		}
	},
	{
		displayName: 'Custom Fields',
		name: 'customfield',
		type: 'string',
		default: '',
		placeholder: 'storeNumber, lineTotal, financialCharges',
		hint: `Extract fields not included in the <a href="https://docs.pdf.co/api-reference/ai-invoice-parser#invoice-schema">default list</a> by entering fields in comma-separated format (e.g., <em>storeNumber, lineTotal, financialCharges</em>)`,
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
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
				operation: [ActionConstants.AiInvoiceParser],
			},
		},
		options: [
			{
				displayName: 'Webhook URL',
				name: 'callback',
				type: 'string', // You can also use "url" if you want built-in URL validation.
				default: '',
				description: 'The callback URL or Webhook used to receive the output data',
				placeholder: 'https://example.com/callback',
				hint: 'Enter a webhook URL to receive the extracted data automatically when parsing is done.',
			},
		],
	}
];


export async function execute(this: IExecuteFunctions, index: number) {
	// Retrieve the "url" parameter.
	const inputUrl = this.getNodeParameter('url', index) as string;

	const customfield = this.getNodeParameter('customfield', index) as string;

	// Retrieve advanced options (returns an empty object if not provided)
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	// Retrieve optional values from advanced options using optional chaining
	const callback = advancedOptions?.callback as string | undefined;

	// Endpoint
	const endpoint = `/v1/ai-invoice-parser`;

	// Build the payload object; add fileName and profiles only if provided
	const body: IDataObject = { url: inputUrl, customfield: customfield, async: true };
	if (callback) body.callback = callback;

	// Make the API request and return the response in the expected format
	const responseData = await pdfcoApiRequestWithJobCheck.call(this, endpoint, body);
	return this.helpers.returnJsonArray(responseData);
}
