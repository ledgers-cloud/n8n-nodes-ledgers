import type { INodeProperties } from 'n8n-workflow';

import { contactOperations as contactOps } from './contactOperations';
import { catalogOperations as catalogOps } from './catalogOperations';
import { createInvoiceOperation as createInvoiceOps } from './createInvoiceOperation';
import { uaeContactOperations as uaeContactOps } from './uaeContactOperations';

export const contactOperations: INodeProperties[] = contactOps;
export const catalogOperations: INodeProperties[] = catalogOps;
export const createInvoiceOperations: INodeProperties[] = createInvoiceOps;
export const uaeContactOperations: INodeProperties[] = uaeContactOps;
