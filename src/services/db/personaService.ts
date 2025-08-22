import { prisma } from '@/lib/prisma';
import { Persona } from '@/types';

// Hardcoded personas for community edition
// Using fixed UUIDs for consistency
const COMMUNITY_PERSONAS: Persona[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Friendly User',
    description: 'A typical friendly user asking questions politely',
    systemPrompt: 'You are a friendly user asking questions in a polite and clear manner.',
    temperature: 0.7,
    messageLength: 'MEDIUM',
    primaryIntent: 'INFORMATION_SEEKING',
    communicationStyle: 'FRIENDLY',
    techSavviness: 'MODERATE',
    emotionalState: 'POSITIVE',
    errorTolerance: 'HIGH',
    decisionSpeed: 'MODERATE',
    slangUsage: 'MINIMAL',
    isDefault: true,
    created_at: new Date(),
    updated_at: new Date(),
    org_id: ''
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Technical Expert',
    description: 'A technically savvy user with detailed questions',
    systemPrompt: 'You are a technical expert asking detailed and specific questions using proper technical terminology.',
    temperature: 0.5,
    messageLength: 'LONG',
    primaryIntent: 'TECHNICAL_SUPPORT',
    communicationStyle: 'FORMAL',
    techSavviness: 'EXPERT',
    emotionalState: 'NEUTRAL',
    errorTolerance: 'LOW',
    decisionSpeed: 'FAST',
    slangUsage: 'NONE',
    isDefault: true,
    created_at: new Date(),
    updated_at: new Date(),
    org_id: ''
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Confused User',
    description: 'A user who needs extra help and clarification',
    systemPrompt: 'You are a confused user who needs things explained simply and may ask follow-up questions for clarification.',
    temperature: 0.8,
    messageLength: 'SHORT',
    primaryIntent: 'HELP_SUPPORT',
    communicationStyle: 'CASUAL',
    techSavviness: 'BEGINNER',
    emotionalState: 'CONFUSED',
    errorTolerance: 'VERY_HIGH',
    decisionSpeed: 'SLOW',
    slangUsage: 'MODERATE',
    isDefault: true,
    created_at: new Date(),
    updated_at: new Date(),
    org_id: ''
  }
];

export class PersonaService {
  async getPersonas(): Promise<Persona[]> {
    // Return hardcoded personas for community edition
    const personasRaw = await prisma.personas.findMany({
      orderBy : {created_at : "desc"}
    })

    // Map DB fields to Persona type
    const personas: Persona[] = personasRaw.map((p:any) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      systemPrompt: p.system_prompt,
      temperature: p.temperature,
      messageLength: p.message_length,
      primaryIntent: p.primary_intent,
      communicationStyle: p.communication_style,
      techSavviness: p.tech_savviness,
      emotionalState: p.emotional_state,
      errorTolerance: p.error_tolerance,
      decisionSpeed: p.decision_speed,
      slangUsage: p.slang_usage ?? "",
      isDefault: p.is_default,
      created_at: p.created_at ,
      updated_at: p.updated_at

    }));

  //  return COMMUNITY_PERSONAS;
    return personas;
  }

  async getPersonaById(personaId: string): Promise<Persona | null> {
    const persona = COMMUNITY_PERSONAS.find((p) => p.id === personaId);
    return persona || null;
  }
    safeJsonParse(str: string) {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return { rawOutput: str };
    }
  }

  async createPersona(persona: {
    id?: string;
    name: string;
    description: string; 
    prompt: string; 
    temperature: number 
    messageLength: string; 
    primaryIntent: string; 
    communicationStyle: string; 
    techSavviness: string; 
    emotionalState: string; 
    errorTolerance: string; 
    decisionSpeed: string; 
    isDefault: true;
    slangUsage ?:string
  }) {
    return await prisma.$transaction(async (tx)=>{

      try {
        if(persona.id){

        }
        else{
          return await tx.personas.create({
            data:{            
              name:persona.name,
              description: persona.description,  
              system_prompt:persona.prompt,
              is_default:persona.isDefault,
              temperature:persona.temperature,
              message_length:persona.messageLength,
              primary_intent:persona.primaryIntent,
              communication_style:persona.communicationStyle,
              tech_savviness:persona.techSavviness,
              emotional_state:persona.emotionalState,
              error_tolerance:persona.errorTolerance,
              decision_speed:persona.decisionSpeed,  
              slang_usage : persona.slangUsage    
            }
          })
        }
      } catch (error) {
        console.log("persona creation error :",error);
      }
    })

    // throw new Error('Custom personas are not available in the community edition');
  }

  async updatePersona(personaId: string, data: any) {
    throw new Error(
      "Custom personas are not available in the community edition"
    );
  }

  async deletePersona(personaId: string) {
    try {
      const result = await prisma.personas.deleteMany({
        where : {id : personaId}
      })
      return { deleted: true };
      
    } catch (error: any) {
      throw new Error("persona deletion error",error.message);
    }
  }
}

export const personaService = new PersonaService();