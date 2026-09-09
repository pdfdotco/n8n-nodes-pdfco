import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions
} from 'n8n-workflow';

import { router } from './actions/router';
import { descriptions } from './Descriptions';
import { loadResource } from './GenericFunctions';

export class PdfCo implements INodeType {

	description: INodeTypeDescription = {
		...descriptions,
		icon: 'file:pdfco.svg',
		subtitle: '={{$parameter["operation"]}}',
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
				async getFonts(this: ILoadOptionsFunctions) {
					return await loadResource.call(this, 'fonts');
				},
				async getLanguages(this: ILoadOptionsFunctions) {
					return await loadResource.call(this, 'languages');
				},
		},
	};

  async execute(this: IExecuteFunctions) {
		return [await router.call(this)];
	}
}
