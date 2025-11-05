import axios from 'axios';
import type { Context } from './configuration';
import { TypeOf } from "zod";
import debug from "debug";
import PCCClient from './client';
import { toLlmError, LlmError } from "./llmError";

const logger = debug('agent-toolkit:functions');


export async function getOrgInfo(
  client: PCCClient,
  context: Context,
  params: TypeOf<ReturnType<typeof import('./parameters').getOrgInfoParameters>>
) {
  console.log('[getOrgInfo] Starting to get organization information with params:', JSON.stringify(params));

  const headers = await client.getHeaders();
  console.log('[getOrgInfo] Headers obtained');
  
  const url = `https://iureqa.pointclickcare.com/chapeauapi/internal/preview1/applications/${params.app_name}/activations?pageSize=200`;

  // Make API call
  try {
    console.log('[getOrgInfo] Sending request to PCC API');
    const response = await axios.get(url, { headers });
    let responseData = response.data;
    // if response.paging.hasMore is true, handle pagination here
    // if (responseData.paging.hasMore) {
    //   console.log('[getOrgInfo] Handling pagination for additional data');
    //   let nextPage = responseData.paging.page * responseData.paging.pageSize;
    //   while (nextPage) {
    //     const paginatedResponse = await axios.get(`${url}&page=${nextPage}`, { headers });
    //     responseData.data = responseData.data.concat(paginatedResponse.data.data);
    //     nextPage = paginatedResponse.data.paging.nextPage;
    //   }
    // }
    //loop through response data and get unique orgId and facs list and return it in an array

    const items = responseData.data || [];
    const orgInfo = Array.isArray(items) ? items.map((org: any) => ({
      orgId: org.orgId,
      facs: org.facs || [],
    })) : [];

    // Get unique orgId and facs list
    const uniqueOrgInfo = Array.from(new Map(orgInfo.map(item => [item.orgId, item])).values());

    return uniqueOrgInfo;
  } catch (error: any) {
    logger('[getOrgInfo] Error getting organization information:', error.message);
    handleAxiosError(error);
  }
}

export async function getPatientData(
  client: PCCClient,
  context: Context,
  params: TypeOf<ReturnType<typeof import('./parameters').getPatientDataParameters>>
) {
  logger('[getPatientData] Starting to get patient data');

  const headers = await client.getHeaders();
  logger('[getPatientData] Headers obtained');
  const url = `https://iureqa.pointclickcare.com/api/internal/preview1/orgs/${params.org_id}/patients?facId=${params.fac_id}&patientStatus=${params.patient_status}`;

  // Make API call
  try {
    logger('[getPatientData] Sending request to PCC API');
    const response = await axios.get(url, { headers });
    //get only patient ids and patient status for the response
    const patientData = response.data.data.map((patient: any) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      patientStatus: patient.patientStatus,
    }));
    logger(`[getPatientData] Patient data retrieved successfully. Status: ${response.status}`);
    return patientData;
  } catch (error: any) {
    logger('[getPatientData] Error getting patient data:', error.message);
    handleAxiosError(error);
  }
}

export async function getActivatedVendorApps(
  client: PCCClient,
  context: Context,
  params: TypeOf<ReturnType<typeof import('./parameters').getActivatedVendorAppsParameters>>
) {
  console.log('[getActivatedVendorApps] Starting to get activated vendor apps with context:', JSON.stringify(context));

  const headers = await client.getHeaders();
  console.log('[getActivatedVendorApps] Headers obtained:', JSON.stringify(headers));
  const url = `https://iureqa.nprd.pointclickcare.com/chapeauapi/internal/preview1/activated-vendor-apps?facId=${params.fac_id}&category=${params.category}&orgId=${params.org_id}`;

  // Make API call
  try {
    console.log('[getActivatedVendorApps] Sending request to PCC API:', url);
    const response = await axios.get(url, { headers });
    console.log(`[getActivatedVendorApps] Activated vendor apps retrieved successfully. Status: ${response.status}`);
    return response.data;
  } catch (error: any) {
    console.log('[getActivatedVendorApps] Error getting activated vendor apps:', error.message);
    handleAxiosError(error);
  }
}

export async function getFacs(
  client: PCCClient,
  context: Context,
  params: TypeOf<ReturnType<typeof import('./parameters').getFacsParameters>>
) {
  console.log('[getFacs] Starting to get FACS with context:', JSON.stringify(params));

  const headers = await client.getHeaders();
  const url = `https://iureqa.pointclickcare.com/api/internal/preview1/orgs/${params.org_id}/facility-search`;
  //add body json
  const body = {
    };
  // Make API call
  try {
    console.log('[getFacs] Sending request to PCC API:', url);
    const response = await axios.post(url, body, { headers });
    console.log(`[getFacs] FACS retrieved successfully. Facs: ${JSON.stringify(response.data)}`);
    //extract only facId, facilityName and healthType from each facs in response.data
    const facs = response.data.data.map((fac: any) => ({
      facId: fac.facId,
      facilityName: fac.facilityName,
      healthType: fac.healthType,
    }));
    return facs;
  } catch (error: any) {
    console.log('[getFacs] Error getting FACS:', error.message);
    handleAxiosError(error);
  }
}


// Helper function to handle Axios errors -> throws LlmError
export function handleAxiosError(error: any): never {
  console.log("[handleAxiosError] Processing error from PCC API", error);

  if (error?.response) {
    const { status, headers, data } = error.response;
    console.log(
      `[handleAxiosError] Response error status: ${status}; header keys: ${JSON.stringify(
        Object.keys(headers ?? {})
      )}`
    );

    let baseMessage: string =
      data?.message ||
      data?.error_description ||
      data?.name ||
      "Unknown error";

    if (data?.details && Array.isArray(data.details)) {
      const detailDescriptions = data.details
        .map((d: any) => d?.description || d?.issue || "")
        .filter(Boolean)
        .join("; ");
      if (detailDescriptions) {
        baseMessage += `: ${detailDescriptions}`;
        logger(`[handleAxiosError] Error details: ${detailDescriptions}`);
      }
    }

    const llmErr: LlmError = toLlmError(baseMessage, {
      code: "PCC_API_HTTP_ERROR",
      status,
      maxDetailLen: 200,
    });

    logger(
      `[handleAxiosError] Throwing LlmError { code: ${llmErr.code}, status: ${llmErr.status} }`
    );
    throw llmErr;
  }

  if (error?.request) {
    logger("[handleAxiosError] No response received from PCC API");

    const llmErr: LlmError = toLlmError(error, {
      code: "PCC_API_NO_RESPONSE",
      maxDetailLen: 200,
    });

    logger(
      `[handleAxiosError] Throwing LlmError { code: ${llmErr.code} }`
    );
    throw llmErr;
  }

  // Setup / config error before sending request
  logger(
    `[handleAxiosError] Error setting up request: ${
      error?.message ?? "Unknown"
    }`
  );

  const llmErr: LlmError = toLlmError(error, {
    code: "PCC_API_SETUP_ERROR",
    maxDetailLen: 200,
  });

  logger(
    `[handleAxiosError] Throwing LlmError { code: ${llmErr.code} }`
  );
  throw llmErr;
}
