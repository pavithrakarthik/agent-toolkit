import { z } from 'zod';

import {
  getPatientDataPrompt,
  getActivatedVendorAppsPrompt
} from './prompts';

import { getActivatedVendorAppsParameters, getPatientDataParameters
} from './parameters';

import type { Context } from './configuration';
import { get } from 'lodash';

export type Tool = {
  method: string;
  name: string;
  description: string;
  parameters: z.ZodObject<any, any, any, any>;
  actions: {
    [key: string]: {
      [action: string]: boolean;
    };
  };
};

const tools = (context: Context): Tool[] => [
  {
    method: 'get_patient_data',
    name: 'Get Patient Data',
    description: getPatientDataPrompt(context),
    parameters: getPatientDataParameters(context),
    actions: {
      patients: {
        get: true,
      },
    },
  },
  {
    method: 'get_activated_vendor_apps',
    name: 'Get Activated Vendor Apps',
    description: getActivatedVendorAppsPrompt(context),
    parameters: getActivatedVendorAppsParameters(context),
    actions: {
      vendor_apps: {
        list: true,
      },
    },
  },
  
];
const allActions = tools({}).reduce((acc, tool) => {
  Object.keys(tool.actions).forEach(product => {
    acc[product] = { ...acc[product], ...tool.actions[product] };
  });
  return acc;
}, {} as { [key: string]: { [key: string]: boolean } });

export const ALL_TOOLS_ENABLED = allActions;

export default tools;
