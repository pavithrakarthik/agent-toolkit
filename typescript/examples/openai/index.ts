import { config } from "@dotenvx/dotenvx";
import OpenAI from "openai";
import { PCCAgentToolkit, ALL_TOOLS_ENABLED } from "@fusionforce/agent-toolkit/openai";
import type {ChatCompletionMessageParam} from "openai/resources";

const envFilePath = process.env.ENV_FILE_PATH || ".env";
config({path: envFilePath});

const llm = new OpenAI();

const ppConfig = { 
    clientId: process.env.PCC_CLIENT_ID || "",
    clientSecret: process.env.PCC_CLIENT_SECRET || "",
    configuration: {
        actions: ALL_TOOLS_ENABLED,
    },
}

const pccToolkit = new PCCAgentToolkit(ppConfig);

(async (): Promise<void> => {
    let messages: ChatCompletionMessageParam[] = [
        {
            role: "user",
            content: "Get me the activated vendor apps for my orgId 12500006.",
        },
    ];

    while (true) {
        const completion = await llm.chat.completions.create({
            model: "gpt-4o",
            messages,
            tools: pccToolkit.getTools(),
        });

        const reply = completion.choices[0].message;
        messages.push(reply);

        if (reply.tool_calls) {
            const toolMessages = await Promise.all(
                reply.tool_calls.map((tc) => pccToolkit.handleToolCall(tc))
            );
            messages = [...messages, ...toolMessages];
        }
        else {
            console.log(completion.choices[0].message);
            break;
        }

    }
})();