"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLMProvider } from "@/services/llm/enums";
import { MODEL_CONFIGS, PROVIDER_MODELS } from "@/services/llm/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LLMServiceConfig } from "@/services/llm/types";
import { ModelFactory } from "@/services/llm/modelfactory";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useErrorContext } from "@/hooks/useErrorContext";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { config } from "zod/v4/core";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyConfigProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ApiKeyConfig({ isOpen, setIsOpen }: ApiKeyConfigProps) {
  const [configs, setConfigs] = useState<LLMServiceConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const errorContext = useErrorContext();
  
  // New model form state
  const [activeTab, setActiveTab] = useState<"models" | "add-new">("models"); // <-- Add this line

  const [provider, setProvider] = useState<LLMProvider>(LLMProvider.Anthropic);
  const [modelId, setModelId] = useState<string>("");
  const [keyName, setKeyName] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectKeyName, setSelectKeyName] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load saved configurations
    const { configs, selectedModelId } = ModelFactory.getUserModelConfigs();
    
    setConfigs(configs);
    setSelectedModelId(selectedModelId);
    
    // Set default model for the selected provider
    if (PROVIDER_MODELS[provider]?.length > 0) {
      setModelId(PROVIDER_MODELS[provider][0]);
    }
   
  }, [provider]);

  const handleSaveConfig = () => {
    try {
      if (!modelId || !apiKey || !keyName) {
        errorContext.showWarning("Please fill in all required fields");
        return;
      }
      const newConfig: LLMServiceConfig = {
        id: modelId,
        provider,
        name: MODEL_CONFIGS[modelId].name,
        apiKey,
        keyName,
        extraParams: provider === LLMProvider.OpenAI && orgId ? { organization: orgId } : {}
      };
      const updatedConfigs = [...configs, newConfig];
      localStorage.setItem("model_configs", JSON.stringify(updatedConfigs));
      if (updatedConfigs.length === 1 || !selectedModelId) {
        localStorage.setItem("selected_model_id", newConfig.id);
        localStorage.setItem("selected_key_name", newConfig.keyName);
        setSelectedModelId(newConfig.id);
        setSelectKeyName(newConfig.keyName);
      }
      toast({ title: "Success", description: newConfig.name
        ? `${newConfig.name} updated`
        : `${newConfig.name} added`, duration: 5000, variant: "success" });
      setConfigs(updatedConfigs);
      resetForm();
      setActiveTab("models");
    } catch (error) {
      errorContext.handleError(error);
    }
  };
  
  const handleSelectModel = (modelId: string, keyName: string) => {
    try {
      localStorage.setItem("selected_model_id", modelId);
      localStorage.setItem("selected_key_name", keyName);
      setSelectedModelId(modelId);
      setSelectKeyName(keyName);
      toast({ title: "Success", description: `Model ${modelId} selected`, duration: 5000, variant: "success" });
    } catch (error) {
      errorContext.handleError(error);
    }
  };

  // Helper: check if update fields are changed
  const isUpdateChanged = () => {
    if (!editId) return false;
    const config = configs.find(c => c.id === editId);
    if (!config) return false;
    const orgVal = config.extraParams?.organization || "";
    return (
      config.apiKey !== apiKey ||
      config.keyName !== keyName ||
      config.provider !== provider ||
      orgVal !== orgId
    );
  };

  const handleUpdateConfig = () => {  
    try {
      // Validate form
      if (!modelId || !apiKey || !keyName) {
        return;
      }

      const updatedConfig: LLMServiceConfig = {
        id: editId || modelId,
        provider,
        name: MODEL_CONFIGS[modelId].name,
        apiKey,
        keyName,
        extraParams: provider === LLMProvider.OpenAI && orgId ? { organization: orgId } : {}
      };

      const configIndex = configs.findIndex(c => c.id === updatedConfig.id);
      if (configIndex === -1) {
        return;
      }
      const updatedConfigs = [...configs];
      updatedConfigs[configIndex] = updatedConfig;
      localStorage.setItem("model_configs", JSON.stringify(updatedConfigs));
      setConfigs(updatedConfigs);
      resetForm();
      setEditId(null); 
      setActiveTab("models");
    } catch (error) {
      errorContext.handleError(error);
    }
  }
 const handleEditConfig = (id: string) => {
  try {
    const config = configs.find(c => c.id === id);
    if(!config) {
      return ;
    }
    setActiveTab("add-new");
    setModelId(config.id);
    setProvider(config.provider);
    setApiKey(config.apiKey);
    setKeyName(config.keyName);
    setEditId(config.id); // Set editId when editing
  } catch (error) {
  }
};

  const handleDeleteConfig = (id: string, keyname: string ) => {
    try {
      const updatedConfigs = configs.filter(c => c.id !== id && c.keyName !== keyname);
      localStorage.setItem("model_configs", JSON.stringify(updatedConfigs));
      
      // If we're deleting the selected model, update selection
      if (selectedModelId === id && selectKeyName === keyname && updatedConfigs.length > 0) {
        localStorage.setItem("selected_model_id", updatedConfigs[0].id);
        localStorage.setItem("selected_key_name", updatedConfigs[0].keyName);

        setSelectedModelId(updatedConfigs[0].id);
        setSelectKeyName(updatedConfigs[0].keyName);
      } else if (updatedConfigs.length === 0) {
        localStorage.removeItem("selected_model_id");
        localStorage.removeItem("selected_key_name");
        setSelectedModelId("");
        setSelectKeyName("");

      }
      toast({ title: "Success", description: id + ` deleted `, duration: 5000, variant: "success" });
      setConfigs(updatedConfigs);
    } catch (error) {
      errorContext.handleError(error);
    }
  };
  
  const resetForm = () => {
    setKeyName("");
    setApiKey("");
    setOrgId("");
  };

  return (
    <div className="max-w-[600px] min-h-[600px] rounded-xl p-5 shadow-md  mt-4 border border-border rounded-lg bg-background p-6 mx-auto">
      <div className="flex flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold">LLM API Configuration</h2>
      </div>
      {errorContext.error && (
        <ErrorDisplay 
          error={errorContext.error}
          onDismiss={errorContext.clearError}
          className="mb-4"
        />
      )}
      <Tabs
        value={activeTab}
        onValueChange={value => {
          setActiveTab(value as "models" | "add-new");
          resetForm();
        }}
      >
        <TabsList className="bg-[#a9acb3] rounded-md p-1 flex w-fit mb-4">
          <TabsTrigger value="models" className={activeTab === 'models' ? 'bg-gray-700 text-black rounded-md' : ''}>Your Models</TabsTrigger>
          <TabsTrigger value="add-new" className={activeTab === 'add-new' ? 'bg-gray-700 text-black rounded-md' : ''}>Add New Model</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          {configs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No models configured yet. Add a new model to get started.
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <Label>Select active model:</Label>
              <div className="space-y-2 max-h-100 overflow-y-auto">
                {configs.map(config => (
                  <div 
                    key={config.id}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      selectedModelId === config.id && selectKeyName ===config.keyName ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-sm text-muted-foreground">{config.keyName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(selectedModelId !== config.id || selectKeyName !== config.keyName)&& (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSelectModel(config.id, config.keyName)
                          }
                        >
                          Use
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteConfig(config.id,config.keyName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditConfig(config.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182l-12.07 12.07a2 2 0 0 1-.878.513l-4 1a.5.5 0 0 1-.606-.606l1-4a2 2 0 0 1 .513-.878l12.07-12.07z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="add-new">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={provider}
                onValueChange={(value) => setProvider(value as LLMProvider)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LLMProvider.Anthropic}>Anthropic</SelectItem>
                  <SelectItem value={LLMProvider.OpenAI}>OpenAI</SelectItem>
                  <SelectItem value={LLMProvider.Google}>Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={modelId}
                onValueChange={setModelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_MODELS[provider]?.map(id => (
                    <SelectItem key={id} value={id}>
                      {MODEL_CONFIGS[id].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Key Name (for your reference)</Label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="E.g., My Personal Key"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div style={{ position: 'relative' }}>
              
                <input
                  type = {showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === LLMProvider.Anthropic ? "sk-ant-..." : "sk-..."}
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    fontSize: 16,
                    outline: 'none',
                    background: 'inherit',
                    color: 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    zIndex: 2,
                    color: '#888',
                  }}
                  tabIndex={-1}
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {provider === LLMProvider.OpenAI && (
              <div className="space-y-2">
                <Label>Organization ID (Optional)</Label>
                <Input
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="org-..."
                />
              </div>
            )}
            <Button
              onClick={editId ? handleUpdateConfig : handleSaveConfig}
              disabled={
                !modelId || !apiKey || !keyName || errorContext.isLoading ||
                (editId ? !isUpdateChanged() : false)
              }
              className="w-full mt-4"
            >
              {editId ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182l-12.07 12.07a2 2 0 0 1-.878.513l-4 1a.5.5 0 0 1-.606-.606l1-4a2 2 0 0 1 .513-.878l12.07-12.07z" />
                  </svg>
                  Update Model
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}