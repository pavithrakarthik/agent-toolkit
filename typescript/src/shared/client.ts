import axios from 'axios';
import { Buffer } from 'buffer';
import os from 'os';
import { version } from '../../package.json';
import { Context } from './configuration';
import debug from "debug";


const logger = debug('agent-toolkit:client');

class PCCClient {
    private _clientId: string | undefined;
    private _clientSecret: string | undefined;
    private _isSandbox: boolean;
    private _accessToken: string | undefined;
    private _baseUrl: string
    private _context: Context

    constructor({ clientId, clientSecret, context }: {
        clientId: string,
        clientSecret: string,
        context: Context
    });

    constructor({ context, accessToken }: {
        context: Context,
        accessToken?: string
    });

    constructor({ clientId, clientSecret, context, accessToken }: {
        clientId?: string,
        clientSecret?: string,
        context: Context,
        accessToken?: string
    }) {

        this._context = context;
        const debugSdk = this._context.debug ?? false;
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._isSandbox = this._context?.sandbox ?? false;
        this._accessToken = accessToken;
        if (this._clientId !== undefined && this._clientSecret !== undefined) {
            // PCC client setup would go here if needed
        }

        this._baseUrl = this._isSandbox
        ? 'https://iureqa.pointclickcare.com'
        : 'https://iure.pointclickcare.com';

        logger(`[PCC Settings] Environment: ${this._isSandbox ? "Sandbox" : "Live"}`);
        logger(`[PCC Settings] API Base: ${this._baseUrl}`);
    }

    async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64');
        const url = `https://ssoqa.pointclickcare.com/as/token.oauth2`;
        try {
            const response = await axios.post(
                url,
                'grant_type=client_credentials&scope=INTERNAL',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': this.generateUserAgent(),
                    },
                }
            );
            return response.data.access_token;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch access token: ${error.response?.data?.error_description || error.message}`);
            } else {
                throw new Error(`Failed to fetch access token: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    // Helper method to get base URL
    getBaseUrl(): string {
        return this._baseUrl;
    }

    // Helper method to get headers
    async getHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        this._accessToken = await this.getAccessToken();
        headers['Authorization'] = `Bearer ${this._accessToken}`;


        headers['User-Agent'] = this.generateUserAgent();

        return headers;
    }

    private generateUserAgent(): string {
        const components = [
            `PCC Agent Toolkit Typescript: ${this._context.source}`,
            `Version: ${version}`,
            `on OS: ${os.platform()} ${os.release()}`
        ];

        return components.filter(Boolean).join(', ');
    }

}

export default PCCClient;
