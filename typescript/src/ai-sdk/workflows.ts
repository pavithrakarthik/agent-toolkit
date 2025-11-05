import { generateObject, generateText, LanguageModelV1 } from 'ai';

import { z } from "zod";
import { PCCAgentToolkit } from "./";
import { getActivatedVendorAppsParameters, getFacsParameters, getOrgInfoParameters, getPatientDataParameters } from '../shared/parameters';
import { Configuration } from '../shared/configuration';
import { getOrgInfo } from '../shared/functions';

class PCCWorkflows {
    readonly toolkit: PCCAgentToolkit;
    log?: (message: any) => void;

    constructor({ clientId, clientSecret, configuration, log }: {
        clientId: string,
        clientSecret: string,
        configuration: Configuration,
        log?: (message: any) => void
    }) {
        this.log = log || console.log
        this.toolkit = new PCCAgentToolkit({
            clientId,
            clientSecret,
            configuration,
        });
    }

    public async getPatientData(llm: LanguageModelV1, userPrompt: string, systemPrompt: string): Promise<string> {
        // Step 1: Generate the patient data request object
        this.log!('Step 1: I am using the provided prompts to create a request object for patient data.');
        const { object: patientDataObject } = await generateObject<z.infer<ReturnType<typeof getPatientDataParameters>>>({
            model: llm,
            schema: getPatientDataParameters({}),
            system: systemPrompt,
            prompt: userPrompt,
        });
        this.log!(`Response 1: I have now created the request object with provided details;\n ${JSON.stringify(patientDataObject)}`);
        this.log!(`Proceeding with next step.`)
        this.log!(`Step 2: I am now choosing the correct tool from PCC's toolkit to Get org data from PCC for the app ${patientDataObject.app_name}`);
        const { text: orgDataText } = await generateText({
            model: llm,
            tools: this.toolkit.getTools(),
            maxSteps: 10,
            prompt: `Get org data from PCC for the app ${patientDataObject.app_name}`,
        });
        this.log!(`Response 2: I have retrieved the org information successfully: ${orgDataText}.`);
        //for each orgId and facs in the orgDataText, get facility data and patient data
        this.log!(`Step 3: I am now choosing the correct tool from PCC's toolkit to retrieve facility information using the generated object from previous step.`);
        patientDataObject.org_id = "12210005";
        console.log('Patient Data Object after adding org', patientDataObject);
        const { text: facilityData } = await generateText({
            model: llm,
            tools: this.toolkit.getTools(),
            maxSteps: 10,
            prompt: `Get facility data with org id ${patientDataObject.org_id} from PCC.`,
        });
        this.log!(`Response 3: I have retrieved the facility information successfully: ${facilityData}.`);
        this.log!(`Step 4: I am now choosing the correct tool from PCC's toolkit to retrieve patient data using the generated object from previous step.`);

        const { text: patientData } = await generateText({
            model: llm,
            tools: this.toolkit.getTools(),
            maxSteps: 10,
            prompt: `Retrieve the patient data and combine with facility data with the following details: ${JSON.stringify(patientDataObject)}.`,
        });
        this.log!(`Response 4: I have retrieved the patient data successfully: ${patientData}.`);
        const summary = `The patient data has been retrieved successfully: ${patientData}.`;
        this.log!(`Output: ${summary}`);
        return summary;
    }

    public async getActivatedVendorApps(llm: LanguageModelV1, userPrompt: string, systemPrompt: string): Promise<string> {
        // Step 1: Generate the activated vendor apps request object
        this.log!('Step 1: I am using the provided prompts to create a request object for activated vendor apps.');
        const { object: activatedVendorAppsObject } = await generateObject<z.infer<ReturnType<typeof getActivatedVendorAppsParameters>>>({
            model: llm,
            schema: getActivatedVendorAppsParameters({}),
            system: systemPrompt,
            prompt: userPrompt,
        });
        this.log!(`Response 1: I have now created the request object with provided details;\n ${JSON.stringify(activatedVendorAppsObject)}`);
        this.log!(`Proceeding with next step.`)
        this.log!(`Step 2: I am now choosing the correct tool from PCC's toolkit to retrieve activated vendor apps using the generated object from previous step.`);
        const { text: orderId } = await generateText({
            model: llm,
            tools: this.toolkit.getTools(),
            maxSteps: 10,
            prompt: `Retrieve the activated vendor apps with the following details: ${JSON.stringify(activatedVendorAppsObject)}.`,
        });
        this.log!(`Response 2: I have retrieved the activated vendor apps successfully: ${orderId}.`);
        const summary = `The activated vendor apps have been retrieved successfully: ${orderId}.`;
        this.log!(`Output: ${summary}`);
        return summary;
    }
}

export default PCCWorkflows;
