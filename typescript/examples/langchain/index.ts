import { config } from '@dotenvx/dotenvx';
import { ChatOpenAI } from '@langchain/openai';
import { PCCAgentToolkit, ALL_TOOLS_ENABLED} from '@fusionforce/agent-toolkit/langchain';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

const envFilePath = process.env.ENV_FILE_PATH || '.env';
config({path: envFilePath});

const llm = new ChatOpenAI({
    temperature: 0.3,
    model: 'gpt-4o', 
  });

const ppConfig = {
    clientId: process.env.PCC_CLIENT_ID || '',
    clientSecret: process.env.PCC_CLIENT_SECRET || '',
    configuration: {
        actions: ALL_TOOLS_ENABLED
    }
}

const pccToolkit = new PCCAgentToolkit(ppConfig);
let tools = pccToolkit.getTools();

(async () => {
    const agent = createReactAgent({
        llm: llm,
        tools: tools,
    });
    
    const result = await agent.invoke(
        {
            messages: [{
                role: "user",
                content: "Get me the activated vendor apps for my orgId 12500006."
            }]
        }
    );
    console.log(result);
})();