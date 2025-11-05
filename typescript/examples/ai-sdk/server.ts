import express from 'express';
import path from 'path';
import { config } from '@dotenvx/dotenvx';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { PCCWorkflows, PCCAgentToolkit, ALL_TOOLS_ENABLED } from '@fusionforce/agent-toolkit/ai-sdk';

const app = express();
const port = 3000;

// Get the env file path from an environment variable, with a default fallback
const envFilePath = process.env.ENV_FILE_PATH || '.env';
config({ path: envFilePath });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
 * PCC Configuration
 */
const ppConfig = {
    clientId: process.env.PCC_CLIENT_ID || '',
    clientSecret: process.env.PCC_CLIENT_SECRET || '',
    configuration: {
        actions: ALL_TOOLS_ENABLED
    }
}

const pccToolkit = new PCCAgentToolkit(ppConfig);
const llm = azureOpenai('gpt-4o-mini');

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for patient data workflow
app.post('/api/patient-data', async (req, res) => {
  try {
    const { userPrompt, systemPrompt } = req.body;
    
    if (!userPrompt || !systemPrompt) {
      return res.status(400).json({ error: 'Both userPrompt and systemPrompt are required' });
    }

    const logs: string[] = [];
    
    // Create workflow with custom logging
    const pccWorkflows = new PCCWorkflows({
      ...ppConfig,
      log: (message: any) => {
        const logMessage = typeof message === 'string' ? message : JSON.stringify(message);
        logs.push(logMessage);
        console.log(logMessage);
      }
    });

    const summary = await pccWorkflows.getPatientData(llm, userPrompt, systemPrompt);
    
    res.json({
      success: true,
      summary,
      logs
    });
  } catch (error) {
    console.error('Error in patient data workflow:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// API endpoint for activated vendor apps workflow
app.post('/api/vendor-apps', async (req, res) => {
  try {
    const { userPrompt, systemPrompt } = req.body;
    
    if (!userPrompt || !systemPrompt) {
      return res.status(400).json({ error: 'Both userPrompt and systemPrompt are required' });
    }

    const logs: string[] = [];
    
    // Create workflow with custom logging
    const pccWorkflows = new PCCWorkflows({
      ...ppConfig,
      log: (message: any) => {
        const logMessage = typeof message === 'string' ? message : JSON.stringify(message);
        logs.push(logMessage);
        console.log(logMessage);
      }
    });

    const summary = await pccWorkflows.getActivatedVendorApps(llm, userPrompt, systemPrompt);
    
    res.json({
      success: true,
      summary,
      logs
    });
  } catch (error) {
    console.error('Error in vendor apps workflow:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// API endpoint for custom toolkit usage
app.post('/api/custom', async (req, res) => {
  try {
    const { userPrompt } = req.body;
    
    if (!userPrompt) {
      return res.status(400).json({ error: 'userPrompt is required' });
    }

    const { text: summary } = await generateText({
      model: llm,
      tools: pccToolkit.getTools(),
      maxSteps: 10,
      prompt: userPrompt,
    });
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in custom workflow:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 PCC Agent Toolkit UI running at http://localhost:${port}`);
});