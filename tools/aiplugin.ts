import { Tool } from './tool';
import { z } from 'zod';

interface AIPluginRes {
  name_for_human: string;
  name_for_model: string;
  description_for_human: string;
  description_for_model: string;
  api: {
    url: string;
  }
}

async function createAIPlugin({
  name,
  url,
}: {
  name: string,
  url: string,
}) {
  const paramsSchema = z.object({
    product: z.string().optional(),
  });

  const aiPluginResRes = await fetch(url);
  if (!aiPluginResRes.ok) {
    throw new Error(`HTTP error! status: ${aiPluginResRes.status}`);
  }
  const aiPluginRes = await aiPluginResRes.json() as AIPluginRes;

  const apiUrlResRes = await fetch(aiPluginRes.api.url);
  if (!apiUrlResRes.ok) {
    return `Failed to execute script: ${apiUrlResRes.status}`;
  }
  const apiUrlRes = await apiUrlResRes.json() as any;

  const execute = async () => {
    return `
OpenAPI Spec in JSON format:\n\n ${JSON.stringify(apiUrlRes)}
\n\n

ATTENTION: Not the actual data! Just the OpenAPI Spec!
If you want to get the actual data, 2 steps are required:
1. Find the API you want to use in the OpenAPI Spec.
2. generate a client for this API.
`
  }

  const description = `Call this tool to get the ${name} Open API specfor interacting
with the ${aiPluginRes.name_for_human} API, But not the actual data!

JUST THE OPEN API SPEC!

If you want to get the actual data, 2 steps are required:
1. Find the API you want to use in the OpenAPI Spec.
2. generate a client for this API.
`;

  return new Tool(paramsSchema, name, description, execute).tool;
}

export { createAIPlugin }
