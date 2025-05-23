import type { INodeType, ICredentialType } from 'n8n-workflow';

import { Ledgers } from './nodes/LEDGERS/LEDGERS.node';
import { LEDGERSApi } from './credentials/LEDGERSApi.credentials';

export const nodes: INodeType[] = [new Ledgers()];
export const credentials: ICredentialType[] = [new LEDGERSApi()];