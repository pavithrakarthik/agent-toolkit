import {config} from '@dotenvx/dotenvx';
import {createOpenAI} from '@ai-sdk/openai';
import {generateText} from 'ai';
import {PayPalWorkflows, PayPalAgentToolkit, ALL_TOOLS_ENABLED} from '@fusionforce/agent-toolkit/ai-sdk';

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
 * This holds all the configuration required for starting PayPal Agent Toolkit
 */

const ppConfig = {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    configuration: {
        actions: ALL_TOOLS_ENABLED
    }
}
/*
 * This holds all the tools that use PayPal functionality
 */
const paypalToolkit = new PayPalAgentToolkit(ppConfig);
/*
 * This holds all the preconfigured common PayPal workflows
 */
const paypalWorkflows = new PayPalWorkflows(ppConfig)

/*
 * This is the merchant's typical use case. This stays the same for most requests.
 */
const systemPrompt = `I am a developer I need to know the activated vendor apps for my orgId 12500006.`;


// User can bring their own llm
const llm = azureOpenai('gpt-4o-mini');

(async () => {

    const userPrompt = `Get me the activated vendor apps for my orgId 12500006.`;

    // Invoke preconfigured workflows that will orchestrate across multiple calls.
    const summary = await paypalWorkflows.getActivatedVendorApps(llm, userPrompt, systemPrompt);
    console.log(summary);
})();
