import { generateObject, generateText, LanguageModelV1 } from 'ai';

import { z } from "zod";
import { PCCAgentToolkit } from "./";
import { getActivatedVendorAppsParameters, getFacsParameters, getOrgInfoParameters, getPatientDataParameters, schemaFacilityList, schemaOrgDataList } from '../shared/parameters';
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
            prompt: `Get org data from PCC for the app ${patientDataObject.app_name} using tool get_org_info.`,
        });
        this.log!(`Response 2: I have retrieved the org information successfully: ${orgDataText}.`);
        
        //extract unique org_id from orgDataText
        
        const { object } = await generateObject<{ orgDataList: z.infer<ReturnType<typeof schemaOrgDataList>> }>({
            model: llm,
            schema: z.object({ orgDataList: schemaOrgDataList() }),
            prompt: `Create an orgDataList object with the org data ${orgDataText}`,
        });
        let orgDataList = object.orgDataList;

        const orgIds = Array.from(new Set(orgDataList.map(org => org.org_id)));
        this.log!(`Extracted unique org_ids: ${JSON.stringify(orgIds)}`);

        this.log!(`Step 3: I am now choosing the correct tool from PCC's toolkit to Get facility data from PCC for the organizations retrieved.`);
        for (const orgId of orgIds) {
            const { text: facilityData } = await generateText({
                model: llm,
                tools: this.toolkit.getTools(),
                maxSteps: 10,
                prompt: `Get facility data from PCC for the following details: ${JSON.stringify({ org_id: orgId })}`,
            });

            const { object: facilityDataObject } = await generateObject<{ facilityList: z.infer<ReturnType<typeof schemaFacilityList>> }>({
                model: llm,
                schema: z.object({ facilityList: schemaFacilityList() }),
                prompt: `Create a facilityList object with the facility data ${facilityData}`,
            });
            // Build a map from fac_id to facility data for faster lookup
            const facilityMap = new Map<string, typeof facilityDataObject.facilityList[number]>();
            for (const facilityData of facilityDataObject.facilityList) {
                facilityMap.set(facilityData.fac_id, facilityData);
            }
            // Process each organization to get facility names using the map
            for (const orgData of orgDataList) {
                const facilityData = facilityMap.get(orgData.fac_id);
                if (facilityData) {
                    orgData.facility_name = facilityData.facility_name || '';
                    orgData.health_type = facilityData.health_type || '';
                }
            }
        }

    this.log!(`Response 3b: Completed processing facility names for all organizations ${JSON.stringify(orgDataList)}`);

        this.log!(`Step 4: I am now choosing the correct tool from PCC's toolkit to retrieve patient data using the generated object from previous step.`);
        //for each orgData in orgDataList, get patient data and combine

        for (const orgData of orgDataList) {
            patientDataObject.org_id = orgData.org_id;
            patientDataObject.fac_id = orgData.fac_id;
        const { text: patientDataText } = await generateText({
            model: llm,
            tools: this.toolkit.getTools(),
            maxSteps: 10,
            prompt: `Retrieve the patient data and combine with facility data with the following details: ${JSON.stringify(patientDataObject)} using tool get_patient_data.`,
        });
        console.log(`Response 4: I have retrieved the patient data successfully for ${orgData.org_id} and ${orgData.fac_id}: ${JSON.stringify(patientDataText)}.`);
        //extract id, status, firstName, lastName, patientStatus from patientData
        const { object: patientDataList } = await generateObject<{ patientList: Array<{ patientId: string; firstName: string; lastName: string; patientStatus: string; }> }> ({
            model: llm,
            schema: z.object({ patientList: z.array(z.object({ 
                patientId: z.string(),
                firstName: z.string().default(''),
                lastName: z.string().default(''),
                patientStatus: z.string().default(''),
            }))}),
            prompt: `Create a patientDataList object with the patient data ${patientDataText}`,
        });
        console.log(`Patient Data: ${JSON.stringify(patientDataList)}.`);
        // Map the patient data to the orgData
        orgData.patientList = patientDataList.patientList;
    }
        this.log!(`The combined data for all organizations: ${JSON.stringify(orgDataList)}.`);
        this.log!(`Step 5: I am now summarizing the retrieved patient data from PCC.`);
        const { text: summarizedText } = await generateText({
            model: llm,
            maxSteps: 10,
            prompt: `Summarize the patient data retrieved from PCC: ${JSON.stringify(orgDataList)}.`,
        });
        this.log!(`Output: ${summarizedText}`);
        return summarizedText;
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
