import { Tool } from "ai";
import PCCAPI from "../shared/api";
import PCCClient from "../shared/client";
import { Configuration, isToolAllowed } from "../shared/configuration";
import tools from '../shared/tools';
import PCCTool from './tools';


const SOURCE = 'AI-SDK';

class PCCAgentToolkit {
    readonly client: PCCClient;
    private _pcc: PCCAPI;
    private _tools: { [key: string]: Tool };

    constructor({ clientId, clientSecret, configuration }: {
        clientId: string,
        clientSecret: string,
        configuration: Configuration,
    }) {
        const context = configuration.context || {};
        this.client = new PCCClient({ clientId: clientId, clientSecret: clientSecret, context: { ...context, source: SOURCE } });
        console.log('PCCClient:', this.client);
        const filteredTools = tools(context).filter((tool) =>
            isToolAllowed(tool, configuration)
        );
        this._pcc = new PCCAPI(this.client, configuration.context);
        this._tools = filteredTools.reduce((acc, item) => {
            acc[item.method] = PCCTool(this._pcc, item.method, item.description, item.parameters);
            return acc;
        }, {} as { [key: string]: Tool });
    }

    getTools(): { [key: string]: Tool } {
        return this._tools;
    }

}

export default PCCAgentToolkit;
