import type { INodeProperties } from 'n8n-workflow';

import { contactOperations as contactOps } from './contactOperations';
import { catalogOperations as catalogOps } from './catalogOperations';
import { SalesOperations as salesOps } from './salesOperations';
import { purchaseOperations as purchaseOps } from './purchaseOperations';
import { hrmsOperations as hrmsOps } from './hrmsOperations';
import { bankingOperations as bankingOps } from './bankingOperations';
import { taxOperations as taxOps } from './taxOperations';

export const contactOperations: INodeProperties[] = contactOps;
export const catalogOperations: INodeProperties[] = catalogOps;
export const salesOperations: INodeProperties[] = salesOps;
export const purchaseOperations: INodeProperties[] = purchaseOps;
export const hrmsOperations: INodeProperties[] = hrmsOps;
export const bankingOperations: INodeProperties[] = bankingOps;
export const taxOperations: INodeProperties[] = taxOps;
