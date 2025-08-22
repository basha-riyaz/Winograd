import React from 'react';
import Image from 'next/image';
import agentImg from '@/public/agent.png';
import personaImg from '@/public/audience.png';
import testcasesImg from '@/public/bugs.png';
import { useRouter } from "next/navigation";

export default function DashboardOverview({ overview }: any) {
    const router = useRouter();
    return (
        <div>
            <div className="font-semibold text-[18px] text-[#333] ">
                Overall Agents Summary  
            </div>

            <div className="bg-[#eceff2] mt-[20px] rounded-lg p-4 shadow-sm flex items-center h-[12vh] w-full transition-all duration-300 hover:scale-105 hover:shadow-1xl">
                <div className="mr-4">
                    <Image src={agentImg} alt="Agent Icon" width={60} height={60} />
                </div>
                <div className="flex flex-col">
                    <div className="text-[36px] font-bold leading-none">
                        {overview?.agentCount}
                    </div>
                    <div className="text-[#888] font-bold text-[16px] mt-1">
                        Total Agents Tested
                    </div>
                </div>
            </div>

            <div className="bg-[#eceff2] mt-[20px] rounded-lg p-4 shadow-sm flex items-center h-[12vh] w-full transition-all duration-300 hover:scale-105 hover:shadow-1xl" onClick={() => router.push('/tools/runs?id=' + run.id)}>
                <div className="mr-4">
                    <Image src={personaImg} alt="Persona Icon" width={60} height={60} />
                </div>
                <div className="flex flex-col">
                    <div className="text-[36px] font-bold leading-none">
                        {overview?.personaCount}
                    </div>
                    <div className="text-[#888] font-bold text-[16px] mt-1">
                        Total Personas
                    </div>
                </div>
            </div>

            <div className="bg-[#eceff2] mt-[20px] rounded-lg p-4 shadow-sm flex items-center h-[12vh] w-full transition-all duration-300 hover:scale-105 hover:shadow-1xl">
                <div className="mr-4">
                    <Image src={testcasesImg} alt="Test Icon" width={60} height={60} />
                </div>
                <div className="flex flex-col">
                    <div className="text-[36px] font-bold leading-none">
                        {overview?.testCases}
                    </div>
                    <div className="text-[#888] font-bold text-[16px] mt-1">
                        Total Test Cases
                    </div>
                </div>
            </div>
        </div>
    );
}
