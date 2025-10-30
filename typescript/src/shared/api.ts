import {
  getPatientData,
  getActivatedVendorApps
} from './functions';

import type { Context } from './configuration';
import PayPalClient from './client';
import {LlmError} from "./llmError"

class PayPalAPI {
  paypalClient: PayPalClient;
  context: Context;
  accessToken?: string;

  constructor(paypalClientOrAccessToken: PayPalClient | string, context?: Context) {
    this.context = context || {};
    if (typeof paypalClientOrAccessToken === 'string') {
      this.accessToken = paypalClientOrAccessToken;
      this.paypalClient = new PayPalClient({context: this.context, accessToken: this.accessToken });
    } else {
      this.paypalClient = paypalClientOrAccessToken;
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
          type: 'paypal_error',
        },
      });
    }
  }

  private async executeMethod(method: string, arg: any): Promise<any> {
    
    switch (method) {
      case 'get_data':
        return getPatientData(this.paypalClient, this.context);
      case 'get_activated_vendor_apps':
        return getActivatedVendorApps(this.paypalClient, this.context, arg);
      default:
        throw new Error(`Invalid method: ${method}`);
    }
  }
}

export default PayPalAPI;
