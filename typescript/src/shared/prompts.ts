import type { Context } from './configuration';

export const getPatientDataPrompt = (context: Context) => `
Get patient data from PCC.

This function retrieves details of a specific patient using their ID.
`;

export const getActivatedVendorAppsPrompt = (context: Context) => `
Get activated vendor apps from PCC.

This function retrieves a list of activated vendor applications for a specific organization.
`;