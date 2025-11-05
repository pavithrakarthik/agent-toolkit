import {config} from '@dotenvx/dotenvx';
import {createOpenAI, openai} from '@ai-sdk/openai';
import {generateText} from 'ai';
import {PCCWorkflows, PCCAgentToolkit, ALL_TOOLS_ENABLED} from '@fusionforce/agent-toolkit/ai-sdk';

// Get the env file path from an environment variable, with a default fallback
const envFilePath = process.env.ENV_FILE_PATH || '.env';
config({path: envFilePath});

/*
 * Configure Azure OpenAI with custom fetch for proper URL handling
 */
const azureOpenai = createOpenAI({
  baseURL: 'https://oai-use2-dcsvc-np-devp-ssv.openai.azure.com/openai/deployments/gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'compatible',
  fetch: async (url, options) => {
    // Ensure the URL has the correct format for Azure OpenAI
    const azureUrl = url.toString().replace('/chat/completions', '/chat/completions?api-version=2024-02-15-preview');
    
    // Use api-key header for Azure OpenAI
    const headers = {
      ...options?.headers,
      'api-key': process.env.OPENAI_API_KEY || '',
    };
    
    return fetch(azureUrl, {
      ...options,
      headers,
    });
  },
});

/*
 * This holds all the configuration required for starting PCC Agent Toolkit
 */

const ppConfig = {
    clientId: process.env.PCC_CLIENT_ID || '',
    clientSecret: process.env.PCC_CLIENT_SECRET || '',
    configuration: {
        actions: ALL_TOOLS_ENABLED
    }
}
/*
 * This holds all the tools that use PCC functionality
 */
const pccToolkit = new PCCAgentToolkit(ppConfig);
/*
 * This holds all the preconfigured common PCC workflows
 */
const pccWorkflows = new PCCWorkflows(ppConfig)

/*
 * This is the merchant's typical use case. This stays the same for most requests.
 */
const systemPrompt = `I am a developer I need to know the patient data for my app name DONTTOUCH1.`;


// User can bring their own llm
const llm = azureOpenai('gpt-4o-mini');

(async () => {

    const userPrompt = `Get me the patient data for my app name DONTTOUCH1 with patient status as current.`;

    // // Invoke preconfigured workflows that will orchestrate across multiple calls.
    const summary = await pccWorkflows.getPatientData(llm, userPrompt, systemPrompt);
    console.log(summary);

        // (or) Invoke through toolkit for specific use-cases
    // const {text: summary} = await generateText({
    //     model: llm,
    //     tools: pccToolkit.getTools(),
    //     maxSteps: 10,
    //     prompt: userPrompt,
    // });
})();
