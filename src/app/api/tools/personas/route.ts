
import { withApiHandler } from "@/lib/api-utils";
import {createPersonaSchema, safeValidateRequest } from "@/lib/validations/api";
import { dbService } from "@/services/db";
import { NotFoundError, ValidationError } from '@/lib/errors';


export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
//   if (id) {
//     const config = await dbService.getAgentConfigAll(id);
//     if (!config) {
//       throw new NotFoundError('Agent not found');
//     }
//     return config;
//   }

  // Return all configs since we don't have user context
  const configs = await dbService.getPersonas();
  return configs;
});

export const POST = withApiHandler(async (request:Request) =>{
    const body = await request.json();
      
      const validation = safeValidateRequest(createPersonaSchema, body);
      if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
      }

      const configData = validation.data;
      
      const result = await dbService.createPersona(configData);
      console.log("created persona results : ",result);
      return result;
})



export const DELETE = withApiHandler(async (request: Request) => {
  const { personaId } = await request.json();
  if (!personaId) {
    throw new ValidationError('personaId is required');
  }
  
  const result = await dbService.deletePersona(personaId);
  return result;
});

