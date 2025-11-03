import PCCAPI from "../shared/api";
import PCCClient from "../shared/client";
import { Configuration, isToolAllowed } from "../shared/configuration";
import tools from "../shared/tools";
import {zodToJsonSchema} from "zod-to-json-schema";
import {ChatCompletionTool, ChatCompletionMessageToolCall, ChatCompletionToolMessageParam,} from "openai/resources";

const SOURCE = "OPENAI";

class PCCAgentToolkit {
    readonly client: PCCClient;
    private _pcc: PCCAPI;
    tools: ChatCompletionTool[];

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
            type: 'function',
            function: {
                name: tool.method,
                description: tool.description,
                parameters: zodToJsonSchema(tool.parameters),
            },
        }));
    }

    getTools(): ChatCompletionTool[] {
        return this.tools;
    }

    async handleToolCall(toolCall: ChatCompletionMessageToolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        const response = await this._pcc.run(toolCall.function.name, args);
        return {
            role: 'tool', 
            tool_call_id: toolCall.id,
            content: response,
        } as ChatCompletionToolMessageParam;
    }
}

export default PCCAgentToolkit;