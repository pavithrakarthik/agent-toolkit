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

export const schemaOrgDataList = () => z.array(z.object({
  org_id: z.string()
    .describe('The ID of the org to retrieve FACS for.'),
  fac_id: z.string()
    .describe('The ID of the facility to retrieve FACS for.'),
  facility_name: z.string()
    .describe('The name of the facility.'),
  health_type: z.string()
    .describe('The health type of the facility.'),
  patientList: z.array(z.object({
    patientId: z.string()
      .describe('The ID of the patient.'),
    firstName: z.string()
      .describe('The first name of the patient.'),
    lastName: z.string()
      .describe('The last name of the patient.'),
    patientStatus: z.string()
      .describe('The patient status.'),
  })).describe('List of patients associated with the organization and facility.'),
}));

export const schemaFacilityList = () => z.array(z.object({
  fac_id: z.string()
    .describe('The ID of the facility to retrieve FACS for.'),
  facility_name: z.string()
    .describe('The name of the facility.'),
  health_type: z.string()
    .describe('The health type of the facility.'),
}));