import type { INodeProperties } from 'n8n-workflow';

import { contactOperations as contactOps } from './contactOperations';
import { catalogOperations as catalogOps } from './catalogOperations';
import { InvoiceOperations as invoiceOps } from './invoiceOperations';
import { QuoteOperations as quoteOps } from './quoteOperations';
import { uaeContactOperations as uaeContactOps } from './uaeContactOperations';

export const contactOperations: INodeProperties[] = contactOps;
export const catalogOperations: INodeProperties[] = catalogOps;
export const invoiceOperations: INodeProperties[] = invoiceOps;
export const quoteOperations: INodeProperties[] = quoteOps;
export const uaeContactOperations: INodeProperties[] = uaeContactOps;
