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

	// n8n's verification linter only inspects the object literal on the class itself,
	// so the properties it checks for are declared here rather than in Descriptions.ts.
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
