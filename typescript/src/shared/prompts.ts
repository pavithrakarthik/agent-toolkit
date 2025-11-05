import type { Context } from './configuration';

export const getOrgInfoPrompt = (context: Context) => `
Get org data from PCC for the app ${context.app_name}.

This function retrieves all the organization details of an activated app from PCC.
`;

export const getActivatedVendorAppsPrompt = (context: Context) => `
Get activated vendor apps from PCC.

This function retrieves a list of activated vendor applications for a specific organization.
`;
export const getPatientDataPrompt = (context: Context) => `
Get patient data from PCC with org id ${context.org_id} and facility id ${context.facility_id} and patient status ${context.patient_status}.

This function retrieves patient data for a specific organization and facility from PCC.
`;

export const getFacilityDataPrompt = (context: Context) => `
Get facility data with org id ${context.org_id} from PCC.

This function retrieves facility data for a specific organization from PCC.
`;

export default {
  getOrgInfoPrompt,
  getActivatedVendorAppsPrompt,
  getPatientDataPrompt,
  getFacilityDataPrompt,
};