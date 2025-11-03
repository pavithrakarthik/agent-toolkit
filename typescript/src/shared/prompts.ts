import type { Context } from './configuration';

export const getPatientDataPrompt = (context: Context) => `
Get patient data from PCC for the app ${context.app_name}.

This function retrieves all the patient details of an activated app from PCC.
`;

export const getActivatedVendorAppsPrompt = (context: Context) => `
Get activated vendor apps from PCC.

This function retrieves a list of activated vendor applications for a specific organization.
`;