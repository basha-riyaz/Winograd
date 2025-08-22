import React, { useState, useMemo } from 'react';

import Image from 'next/image';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import communityImg from '@/public/community.png';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, Separator, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { ChevronDown, UserCog } from 'lucide-react';
import { personaColors } from '@/config/features';
import { outerColors } from '@/config/features';


const tooltipStyle = {
    background: '#d6dada',
    color: '#000000',
    border: '1px solid #d6dada',
    borderRadius: 8,
    fontSize: 16,
    padding: 12,
};



export default function DashboardGraph({ innerData, outerData, activeInnerIndex, activeOuterIndex, handleInnerEnter, handleInnerLeave, handleOuterEnter, handleOuterLeave, agentList, selectedAgent, handleLoadAgent }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredAgents = useMemo(() => {
        if (!Array.isArray(agentList)) return [];
        if (!searchTerm) return agentList;
        return agentList.filter((agent: any) =>
            agent.agentName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agentList, searchTerm]);
    

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <span className="font-semibold text-lg">Persona-wise Test Distribution</span>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-green-500 w-[180px]"
            >
              <UserCog className="w-4 h-4" />
              <span>
                {selectedAgent === "all"
                  ? "All Agents"
                  : agentList?.find((a: any) => a.agentID === selectedAgent)?.agentName ||
                    "Select Agent"}
              </span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-[180px] p-2 z-50">
            <input
              type="text"
              placeholder="Search agent..."
              className="w-full px-2 py-1 mb-2 text-sm border rounded outline-none focus:ring-2 focus:ring-green-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Separator className="my-1" />

            <DropdownMenuItem
              key="all-agents"
              onClick={() => handleLoadAgent("all")}
              className={`flex items-center gap-2 cursor-pointer w-full
                ${selectedAgent === "all" ? "text-green-600 dark:text-green-400 font-bold" : ""}
                hover:text-gray-800 dark:hover:text-gray-300 hover:font-bold bg-white dark:bg-gray-900`}
            >
              All Agents
            </DropdownMenuItem>

            <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent: any, index: number) => (
                  <DropdownMenuItem
                    key={agent.agentID}
                    onClick={() => handleLoadAgent(agent.agentID)}
                    className={`flex items-center gap-2 cursor-pointer w-full mt-2
                      ${selectedAgent === agent.agentID ? "text-green-600 dark:text-green-400 font-bold" : ""}
                      hover:text-gray-800 dark:hover:text-gray-300 hover:font-bold
                      ${index % 2 === 0 ? "bg-gray-200 dark:bg-gray-400" : "bg-white dark:bg-gray-900"}`}
                  >
                    {agent.agentName}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="text-muted-foreground/70 w-full">
                  No matching agents
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div className="w-full h-[322px] -mt-5">
      <ResponsiveContainer width="100%" height="100%" style={{ marginLeft: "-70px" }}>
        <PieChart>
            <Pie
                data={innerData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={false}
                onMouseEnter={handleInnerEnter}
                onMouseLeave={handleInnerLeave}            
            >
                {innerData.map((entry: any, index: any) => (
                <Cell
                    key={`cell-inner-${index}`}
                    fill={
                    activeInnerIndex === index
                        ? "#d3d3d3"
                        : personaColors[index % personaColors.length]
                    }
                />
                ))}
            </Pie>

            <Pie
                data={outerData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={130}
                onMouseEnter={handleOuterEnter}
                onMouseLeave={handleOuterLeave}
                label={false}            
            >
                {outerData.map((entry: any, index: any) => (
                <Cell
                    key={`cell-outer-${index}`}
                    fill={
                    activeOuterIndex === index
                        ? "#d3d3d3"
                        : outerColors[entry.type as keyof typeof outerColors]
                    }
                />
                ))}
            </Pie>

            <Tooltip contentStyle={tooltipStyle} />
            <Legend
                // wrapperStyle={{ marginTop: -64, marginLeft: 30 }}
                payload={innerData.map((entry: any, index: any) => ({
                  value: entry.name,
                  type: "circle",
                  color: personaColors[index % personaColors.length],
                  id: entry.name,
                }))}
            />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="flex justify-center gap-5 mt-4" style={{ marginLeft: "-150px", marginTop: "32px" }}>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: outerColors.Passed }} />
        <span className="text-base">Passed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: outerColors.Failed }} />
        <span className="text-base">Failed</span>
      </div>
    </div>
  </div>
);

}

