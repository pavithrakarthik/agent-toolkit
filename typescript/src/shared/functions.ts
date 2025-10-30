import axios from 'axios';
import type { Context } from './configuration';
import { TypeOf } from "zod";
import debug from "debug";
import PayPalClient from './client';
import { toLlmError, LlmError } from "./llmError";

const logger = debug('agent-toolkit:functions');


export async function getPatientData(
  client: PCCClient,
  context: Context,
) {
  logger('[getPatientData] Starting to get patient data');

  const headers = await client.getHeaders();
  logger('[getPatientData] Headers obtained');

  const url = `https://iureqa.pointclickcare.com/chapeauapi/internal/preview1/activated-vendor-apps?orgId=12500006&facId=1&category=LABORATORY`;

  // Make API call
  try {
    logger('[getPatientData] Sending request to PCC API');
    const response = await axios.get(url, { headers });
    logger(`[getPatientData] Patient data retrieved successfully. Status: ${response.status}`);
    return response.data;
  } catch (error: any) {
    logger('[getPatientData] Error getting patient data:', error.message);
    handleAxiosError(error);
  }
}
export async function getActivatedVendorApps(
  client: PayPalClient,
  context: Context,
  params: TypeOf<ReturnType<typeof import('./parameters').getActivatedVendorAppsParameters>>
) {
  console.log('[getActivatedVendorApps] Starting to get activated vendor apps with context:', JSON.stringify(context));

  const headers = await client.getHeaders();
  console.log('[getActivatedVendorApps] Headers obtained:', JSON.stringify(headers));

  const url = `https://iureqa.pointclickcare.com/chapeauapi/internal/preview1/activated-vendor-apps?orgId=${params.org_id}&facId=1&category=LABORATORY`;

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

// Helper function to handle Axios errors -> throws LlmError
export function handleAxiosError(error: any): never {
  console.log("[handleAxiosError] Processing error from PCC API");

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
