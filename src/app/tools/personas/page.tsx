'use client';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import WarningDialog from "@/components/config/WarningDialog";
import { usePersonas } from "@/hooks/usePersonas";
import { useErrorContext } from "@/hooks/useErrorContext";
import { dbService } from "@/services/db";
import PersonaList from "@/components/tools/personas/PersonasList";
import { Persona } from '@/types';


export default function personasPage() {
    const [ personas, setPersonas ] = useState<Persona[]>([]);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [warningDialogContent, setWarningDialogContent] = useState({
        title: "warning",
        message: "something went wrong",
        severity: "info"
    });
    const errorContext = useErrorContext();

    useEffect(() => {
        if (personas && personasPage.length > 0) {
            setPersonas(personas);
        }

    }, [personas]);

    useEffect(() => {
        const fetchPersonas = async () => {
            setIsLocalLoading(true);
            await errorContext.withErrorHandling(async () => {
                const res = await fetch('/api/tools/personas', {
                    method: 'GET',
                    headers: {
                        'Content-Type': "application/json"
                    }
                })

                const personaList = await res.json();

                console.log(personaList.data);
                setPersonas(personaList.data);
            }, false); // Don't use global loading state
            setIsLocalLoading(false);
        };

        fetchPersonas();

    }, [errorContext])


    return (
        <>
            <PersonaList
                personas={personas}
                isLoading={false}
            />

            {showWarningDialog && (
                <WarningDialog
                    isOpen={showWarningDialog}
                    title={warningDialogContent.title}
                    message={warningDialogContent.message}
                    severity={warningDialogContent.severity}
                    onClose={() => setShowWarningDialog(false)}
                />
            )}
        </>
    )
}