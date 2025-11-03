import PCCAPI from "../shared/api";
import PCCClient from "../shared/client";
import { Configuration, isToolAllowed } from "../shared/configuration";
import tools from "../shared/tools";
import { zodToJsonSchema } from "zod-to-json-schema";

const SOURCE = "BEDROCK";

export interface BedrockTool {
    toolSpec: {
        name: string;
        description: string;
        inputSchema: {
            json: any;
        }
    }
}

export interface BedrockToolBlock {
    toolUseId: string;
    name: string;
    input: any;
}

export interface BedrockToolResult {
    toolUseId: string;
    content: Array<{
        text:string;
    }>;
}

class PCCAgentToolkit {
    readonly client: PCCClient;
    private _pcc: PCCAPI;
    tools: BedrockTool[];

    constructor({ clientId, clientSecret, configuration, }: {
        clientId: string,
        clientSecret: string,
        configuration: Configuration;
    }) {
        const context = configuration.context || {};
        this.client = new PCCClient({ clientId: clientId, clientSecret: clientSecret, context: {...context, source: SOURCE }});
        const filteredTools = tools(context).filter((tool) => 
            isToolAllowed(tool, configuration)
        );
        this._pcc = new PCCAPI(this.client, configuration.context);
        this.tools = filteredTools.map((tool) => ({
            toolSpec: {
                name: tool.method,
                description: tool.description,
                inputSchema: {
                    json: zodToJsonSchema(tool.parameters)
                }
            }
        }));
    }

    getTools(): BedrockTool[] {
        return this.tools;
    }

    async handleToolCall(toolCall: BedrockToolBlock): Promise<BedrockToolResult> {
        const response = await this._pcc.run(toolCall.name, toolCall.input);
        return {
            toolUseId: toolCall.toolUseId,
            content: [
                {
                    text: JSON.stringify(response)
                }
            ]
        };
    }
}

export default PCCAgentToolkit;