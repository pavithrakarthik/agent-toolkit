import { z } from 'zod';
import type { Context } from './configuration';

export const getOrgInfoParameters = (context: Context) => z.object({
    app_name: z.string()
    .describe('The name of the application making the request.'),
});
export const getPatientDataParameters = (context: Context) => z.object({
  app_name: z.string()
    .describe('The name of the application making the request.'),
  org_id: z.string()
    .describe('The ID of the org to retrieve patients for.'),
  fac_id: z.string()
    .describe('The ID of the facility to retrieve patients for.'),
  patient_status: z.string()
    .describe('The status of the patients to retrieve.'),
});

export const getActivatedVendorAppsParameters = (context: Context) => z.object({
  org_id: z.string()
    .describe('The ID of the org to retrieve activated vendor apps for.'),
  fac_id: z.string()
    .describe('The ID of the facility to retrieve activated vendor apps for.'),
  category: z.string()
    .describe('The category of vendor apps to retrieve.'),
});


export const getFacsParameters = (context: Context) => z.object({
  org_id: z.string()
    .describe('The ID of the org to retrieve FACS for.')
});
