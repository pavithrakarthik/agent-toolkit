/**
 * PCC Agent LangChain Toolkit in TypeScript
 */

import {BaseToolkit} from "@langchain/core/tools";
import PCCAPI from "../shared/api";
import PCCClient from "../shared/client";
import { Configuration, isToolAllowed } from "../shared/configuration";
import tools from "../shared/tools";
import PCCTool from "./tool";

const SOURCE = "LANGCHAIN";

class PCCAgentToolkit implements BaseToolkit {
    readonly client: PCCClient;
    private _pcc: PCCAPI;
    tools: PCCTool[];

    constructor({ clientId, clientSecret, configuration, }: {
        clientId: string,
        clientSecret: string,
        configuration: Configuration;
    }) {
        const context = configuration.context || {};
        this.client = new PCCClient({ clientId: clientId, clientSecret: clientSecret, context: { ...context, source: SOURCE }});
        const filteredTools = tools(context).filter((tool) =>
            isToolAllowed(tool, configuration)
        ); 
        this._pcc = new PCCAPI(this.client, configuration.context);
        this.tools = filteredTools.map(
            (tool) =>
                new PCCTool(
                    this._pcc, 
                    tool.method,
                    tool.name,
                    tool.description,
                    tool.parameters,
                )
        );
    }

    getTools(): PCCTool[] {
        return this.tools;
    }
}

export default PCCAgentToolkit;