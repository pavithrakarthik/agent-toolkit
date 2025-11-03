import type { Tool } from 'ai';
import { tool } from 'ai';
import { z } from 'zod';
import PCCAPI from '../shared/api';

export default function PCCTool(
  pccApi: PCCAPI,
  method: string,
  description: string,
  schema: z.ZodObject<any, any, any, any, { [x: string]: any }>
): Tool {
  return tool({
    description: description,
    parameters: schema,
    execute: (arg: z.output<typeof schema>) => {
      return pccApi.run(method, arg);
    },
  });
}