import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { colors } from '@/config/features';

const healthColors =  colors as any;

export default function AgentTable({ agentList }: any) {
    return (        
        <div className="h-full flex flex-col">
            <span className="text-lg font-semibold mb-2">Agent Status</span>
            <div className="sticky top-0 z-20">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#d3d3d3] sticky top-0 z-20 hover:bg-[#9f9e9e]">
                            <TableHead className="text-black dark:text-white text-lg font-bold w-[12vw]">
                                Name
                            </TableHead>
                            <TableHead className="text-black dark:text-white text-lg font-bold w-[7vw]">
                                Health
                            </TableHead>
                            <TableHead className="text-black  dark:text-white text-lg font-bold w-[10vw]">
                                Last Run
                            </TableHead>
                            <TableHead className="text-black dark:text-white text-lg font-bold w-[7vw]">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>

            <div className="flex-1 overflow-y-auto">
                <Table>
                    <TableBody>
                        {agentList?.map((agent: any, index: number) => (
                            <TableRow
                                key={agent.agentID}
                                className={`text-base font-medium transition-colors  w-[15vw] 
                                            ${index % 2 === 1 ? 'bg-[#eceff2]' : 'bg-white'} 
                                    hover:bg-[#e6f4ea]`}>
                                <TableCell className="flex items-center gap-2">
                                    {agent.agentName}
                                </TableCell>

                                <TableCell className="text-center w-[7vw]">
                                    <span
                                        className="inline-block min-w-[100px] font-semibold text-black text-[16px] leading-5 rounded px-2 py-1"
                                        style={{ backgroundColor: healthColors[agent.health as keyof typeof healthColors] }}
                                    >
                                        {agent.health}                                        
                                    </span>
                                </TableCell>

                                <TableCell className="text-left w-[10vw]">
                                    {agent.lastRun}
                                </TableCell>

                                <TableCell className="text-left w-[7vw]">
                                    <span
                                        className={
                                            agent.agentStatus == 'ACTIVE'
                                                ? 'blinking-green' : 'blinking-red'
                                        }
                                    >
                                        {agent.agentStatus}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>


    );
}
