import type { INodeProperties } from 'n8n-workflow';

import { contactOperations as contactOps } from './contactOperations';
import { catalogOperations as catalogOps } from './catalogOperations';
import { createInvoiceOperation as createInvoiceOps } from './createInvoiceOperation';

export const contactOperations: INodeProperties[] = contactOps;
export const catalogOperations: INodeProperties[] = catalogOps;
export const createInvoiceOperations: INodeProperties[] = createInvoiceOps;
