import { z } from 'zod';
import type { Context } from './configuration';

export const getPatientDataParameters = (context: Context) => z.object({
  patient_id: z.string()
        .describe('The ID of the patient to retrieve.'),
});

export const getActivatedVendorAppsParameters = (context: Context) => z.object({
  org_id: z.string()
    .describe('The ID of the org to retrieve activated vendor apps for.'),
});
