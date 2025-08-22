'use client';

import { Persona } from "@/types/persona";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useErrorContext } from "@/hooks/useErrorContext";
import { Pen, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Play, ChevronDown, RefreshCw, CheckCircle2, XCircle, Clock, FileX, ArrowRight } from "lucide-react";
import { runInCleanSnapshot } from "next/dist/server/app-render/clean-async-snapshot-instance";
import { useState, useEffect } from "react";
import { dbService } from "@/services/db";
import { personas } from "@prisma/client";


interface PersonasProps {
    personas: Persona[]
    isLoading?: boolean
}

function LoadingSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[10%] min-w-[50px]">Personas</TableHead>
                        <TableHead className="w-[10%] min-w-[50px]">Description</TableHead>
                        <TableHead className="text-center">Temp</TableHead>
                        <TableHead className="text-center">M-len</TableHead>
                        <TableHead className="text-center">P-intent</TableHead>
                        <TableHead className="text-center">C-style</TableHead>
                        <TableHead className="text-center">T-savviness</TableHead>
                        <TableHead className="text-center">EM-status</TableHead>
                        <TableHead className="text-center">ER-tolerance</TableHead>
                        <TableHead className="text-center">D-speed</TableHead>
                        {/* <TableHead className="text-center">active/inactive</TableHead> */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-8 bg-muted rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="h-4 w-12 bg-muted rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="space-y-1">
                                    <div className="h-3 w-12 bg-muted rounded animate-pulse mx-auto" />
                                    <div className="h-2 w-full max-w-[100px] bg-muted rounded animate-pulse mx-auto" />
                                </div>
                            </TableCell>
                            {/* <TableCell>
                                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                            </TableCell> */}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}


export default function PersonaList({
    personas,
    isLoading = false
}: PersonasProps) {

    const MessageLength = ["Short", "Medium", "Long"]
    const PrimaryIntent = ["Information-seeking", "Transactional", "Support Query", "Feedback"]
    const CommunicationStyle = ["Formal", "Casual", "Sarcastic", "Concise", "Detailed"]
    const TechSavviness = ["Beginner", "Intermediate", "Advanced"]
    const EmotionalState = ["Neutral", "Frustrated", "Happy", "Curious"]
    const ErrorTolerance = ["Low", "Medium", "High"]
    const DecisionSpeed = ["Fast", "Thoughtful", "Hesitant"]
    const SlangUsage = ["None", "Moderate", "Heavy"]


    const { error, clearError } = useErrorContext();
    const { toast } = useToast();
    const [hovered, setHovered] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id:'',
        name: '',
        description: '',
        prompt: '',
        temperature: 0,
        messageLength: '',
        primaryIntent: '',
        communicationStyle: '',
        techSavviness: '',
        emotionalState: '',
        errorTolerance: '',
        decisionSpeed: '',
        isDefault: true,
        slangUsage: '',
        historyBasedMemory: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    const [localPersonas, setLocalPersonas] = useState<Persona[]>(personas || []);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonas = async () => {
            if (localPersonas && localPersonas.length == 0) {
                // const personaList = await dbService.getPersonas();
                const res = await fetch('/api/tools/personas', {
                    method: 'GET',
                    headers: {
                        'Content-Type': "application/json"
                    }
                })
                const personaList = await res.json();
                setLocalPersonas(personaList.data);
            }
        };

        fetchPersonas();

    }, [localPersonas])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;

        // Convert temperature to number if the field is "temperature"
        const newValue = name === "temperature" ? Number(value) : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
            [name]: type === 'checkbox' ? checked : value,
        }));

    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            // Update existing persona
            setLocalPersonas((prev: any) =>
                prev.map((p) => (p.id === editingId ? { ...p, ...formData } : p))
            );
            setEditingId(null);
            setShowForm(false);
            toast({ title: "Success", description: "Persona updated", duration: 5000, variant: "success" });

        } else {
            // Add a new persona to local state (simulate save)
            // const newPersona: Persona = {
            //     id: Math.random().toString(36).substr(2, 9),
            //     ...formData,

            // };
            formData.temperature = Number(formData.temperature);


            //! save the persona object into database
            // Save the agent configuration
            const response = await fetch('/api/tools/personas', {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save agent configuration');
            }
            const result = await response.json();

            formData.id = result.data.id;

            setLocalPersonas((prev) => [...prev, formData]);
            setShowForm(false);
            setFormData({
                id:'',
                name: '',
                description: '',
                prompt: '',
                temperature: 0,
                messageLength: '',
                primaryIntent: '',
                communicationStyle: '',
                techSavviness: '',
                emotionalState: '',
                errorTolerance: '',
                decisionSpeed: '',
                isDefault: true,
                slangUsage: "",
                historyBasedMemory: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            toast({ title: "Success", description: 'Persona added', duration: 5000, variant: "success" });
            console.log("new persona",formData);
        }
    };

    const handleDelete = async (deleteId: string) => {

        if (deleteId) {
            const delid = localPersonas.findIndex((p) => p.id === deleteId);
            if (delid >= 0) {
                const res = await fetch('/api/tools/personas', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ personaId: deleteId }),
                })

              if (res.ok) {
                  localPersonas.splice(delid, 1);
                  setLocalPersonas(localPersonas);
                  toast({ title: "Success", description: `Persona deleted` + deleteId, duration: 5000, variant: "destructive" });
              }
            }
            else {
                console.log('no persona id present in the req', deleteId )
            }
        }
        else {
            toast({ title: "Success", description: 'Persona id not present', duration: 5000, variant: "destructive" });

        }
    }

    return (
        <div className="max-w-8xl mx-auto space-y-4">
            {error && (
                <ErrorDisplay
                    error={error}
                    onDismiss={clearError}
                    onRetry={error.retry ? () => error.retry?.() : undefined}
                    showRetry={!!error.retry}
                    className="mb-4"
                />
            )}

            <div className="flex justify-between items-center  ml-10 mb-5">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Personas</h1>
                    <p className="text-sm text-muted-foreground mt-1">Helps to identify agent variations</p>
                </div>
                <div className="flex justify-items-end">
                    <Button
                        size="lg"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="h-4 w-4" />
                        ADD
                    </Button>
                </div>
            </div>

            {showForm ? (
                <Card className="p-6 max-w-2xl mx-auto">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded px-2 py-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Temperature</label>
                                <input type="number" min={0} max={1} step={0.1} name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full border rounded px-2 py-1" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded px-2 py-1" rows={2} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">Prompt</label>
                                <textarea name="prompt" value={formData.prompt} onChange={handleInputChange} className="w-full border rounded px-2 py-1" rows={2} />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium">Message Length</label>
                                <input name="messageLength" value={formData.messageLength} onChange={handleInputChange} className="w-full border rounded px-2 py-1" />
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium">Message Length</label>
                                <select
                                    name="messageLength"
                                    value={formData.messageLength}
                                    // onChange={(e) =>
                                    //     setFormData((prev) => ({
                                    //         ...prev,
                                    //         messageLength: e.target.value,
                                    //     }))
                                    // }
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-2 py-1"
                                >
                                    <option value="">-- Select an option --</option>
                                    {MessageLength.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Primary Intent</label>
                                {/* <input name="primaryIntent" value={formData.primaryIntent} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="primaryIntent" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {PrimaryIntent.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Communication Style</label>
                                {/* <input name="communicationStyle" value={formData.communicationStyle} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="communicationStyle" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {CommunicationStyle.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Tech Savviness</label>
                                {/* <input name="techSavviness" value={formData.techSavviness} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="techSavviness" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {TechSavviness.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div>
                                <label className="block text-sm font-medium">Emotional State</label>
                                {/* <input name="emotionalState" value={formData.emotionalState} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="emotionalState" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {EmotionalState.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Error Tolerance</label>
                                {/* <input name="errorTolerance" value={formData.errorTolerance} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="errorTolerance" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {ErrorTolerance.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Decision Speed</label>
                                {/* <input name="decisionSpeed" value={formData.decisionSpeed} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="decisionSpeed" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {DecisionSpeed.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Decision Speed</label>
                                {/* <input name="decisionSpeed" value={formData.decisionSpeed} onChange={handleInputChange} className="w-full border rounded px-2 py-1" /> */}
                                <select name="slangUsage" onChange={handleInputChange} className="w-full border rounded px-2 py-1" >
                                    <option value="">-- Select an option --</option>
                                    {SlangUsage.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <div className="flex items-center gap-2 col-span-2">
                                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} />
                                <label className="text-sm">Active</label>
                            </div> */}
                        </div>
                        <div className="flex gap-4 justify-end">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" variant="default">{editingId ? "Update" : "Save"}</Button>
                        </div>
                    </form>
                </Card>
            ) : isLoading ? (
                <LoadingSkeleton />
            ) : !localPersonas || localPersonas.length === 0 ? (
                <Card className="border-dashed">
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No personas yet</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-sm">
                            Start by configuring a persona by clicking "Add Persona".
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="w-full overflow-x-auto">
                    <Card className="overflow-visible">
                        <Table>
                            <TableHeader>
                                <TableRow >
                                    <TableHead className="w-[10%] min-w-[50px]">Personas</TableHead>
                                    <TableHead className="w-[10%] min-w-[50px]">Description</TableHead>
                                    <TableHead className="text-center">Temp</TableHead>
                                    <TableHead className="text-center">M-len</TableHead>
                                    <TableHead className="text-center">P-intent</TableHead>
                                    <TableHead className="text-center">C-style</TableHead>
                                    <TableHead className="text-center">T-savviness</TableHead>
                                    <TableHead className="text-center">EM-status</TableHead>
                                    <TableHead className="text-center">ER-tolerance</TableHead>
                                    <TableHead className="text-center">D-speed</TableHead>
                                    {/* <TableHead className="text-center">Active</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localPersonas?.map((run) => {
                                    return (
                                        <TableRow
                                            key={run.id}
                                            className="  transition-colors hover:bg-muted/90"
                                        >
                                            <TableCell className="font-medium max-w-[100px]">
                                                <div className="space-y-1">
                                                    <div className="font-medium truncate" title={run.name}>{run.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {run.id.slice(0, 8)}...</div>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="font-medium max-w-[100px] px-4 py-2 relative truncate "
                                                onMouseEnter={() => setHovered(run.id)}
                                                onMouseLeave={() => setHovered(null)}
                                            >
                                                {run.description.length > 100
                                                    ? `${run.description.slice(0, 100)}...`
                                                    : run.description}
                                                {hovered === run.id && (
                                                    <div className="absolute top-full left-0 mt-1 bg-white border shadow-lg p-2 w-80 z-50 text-sm break-words">
                                                        {run.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="font-medium">{run.temperature}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="font-medium">{run.messageLength}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{run.primaryIntent}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{run.communicationStyle}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{run.techSavviness}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{run.emotionalState}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{run.errorTolerance}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{run.decisionSpeed}</span>
                                                </div>
                                            </TableCell>
                                            {/* <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    {run.isDefault ? (
                                                        <CheckCircle2 className="text-green-500" size={18} />
                                                    ) : (
                                                        <XCircle className="text-gray-400" size={18} />
                                                    )}
                                                </div>
                                            </TableCell> */}
                                            {/*
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={async () => {
                                                            setFormData({ ...run });
                                                            setEditingId(run.id);
                                                            setShowForm(true);
                                                            toast({ title: "Success", description: 'Persona edited', duration: 5000, variant: "success" });
                                                        }}>
                                                        <Pen className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={async () => {
                                                            handleDelete(run.id);
                                                            setEditingId(run.id);
                                                        }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            */}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            )}
        </div>
    );
}
