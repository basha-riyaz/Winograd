import { useState } from "react";

export type messageLength = "SHORT" | "MEDIUM" | "LONG";
export type PersonaConfig = {
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  messageLength: messageLength;
  primaryIntent: string;
  communicationStyle: string;
  techSavviness: string;
  emotionalState: string;
  errorTolerance: string;
  decisionSpeed: string;
  slangUsage: string;
  isDefault: boolean;
};

export function usePersonas() {
  const { personas, setPersonas, newPersona, updatePersona } =
    useState<PersonaConfig>;

  setPersonas((pre)=>{
    const newPersona = {
      name: "Technical Expert",
      description: "A technically savvy user with detailed questions",
      systemPrompt:
        "You are a technical expert asking detailed and specific questions using proper technical terminology.",
      temperature: 0.5,
      messageLength: "LONG",
      primaryIntent: "TECHNICAL_SUPPORT",
      communicationStyle: "FORMAL",
      techSavviness: "EXPERT",
      emotionalState: "NEUTRAL",
      errorTolerance: "LOW",
      decisionSpeed: "FAST",
      slangUsage: "NONE",
      isDefault: true,
    };
    return [newPersona,...pre];
  } );
    

  return {
    personas,
    setPersonas,
    newPersona,
    updatePersona,
  };
}
