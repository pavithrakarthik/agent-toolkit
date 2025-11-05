import {
  getPatientData,
  getActivatedVendorApps,
  getFacs,
  getOrgInfo
} from './functions';

import type { Context } from './configuration';
import PCCClient from './client';
import {LlmError} from "./llmError"

class PCCAPI {
  pccClient: PCCClient;
  context: Context;
  accessToken?: string;

  constructor(pccClientOrAccessToken: PCCClient | string, context?: Context) {
    this.context = context || {};
    if (typeof pccClientOrAccessToken === 'string') {
      this.accessToken = pccClientOrAccessToken;
      this.pccClient = new PCCClient({context: this.context, accessToken: this.accessToken });
    } else {
      this.pccClient = pccClientOrAccessToken;
    }

    

  }


  async run(method: string, arg: any): Promise<string> {
    try {
      const output = await this.executeMethod(method, arg);
      return JSON.stringify(output);
    } catch (error: any) {

      if (error instanceof LlmError) {
        return JSON.stringify(error);
      }
      const errorMessage = error.message || 'Unknown error';
      return JSON.stringify({
        error: {
          message: errorMessage,
          type: 'pcc_error',
        },
      });
    }
  }

  private async executeMethod(method: string, arg: any): Promise<any> {
    
    switch (method) {
      case 'get_patient_data':
        return getPatientData(this.pccClient, this.context, arg);
      case 'get_activated_vendor_apps':
        return getActivatedVendorApps(this.pccClient, this.context, arg);
      case 'get_facility_data':
        return getFacs(this.pccClient, this.context, arg);
      case 'get_org_info':
        return getOrgInfo(this.pccClient, this.context, arg);
      default:  
        throw new Error(`Invalid method: ${method}`);
    }
  }
}

export default PCCAPI;
