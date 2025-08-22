"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/app/loading";
import AgentTable from "./dashboard/AgentTable";
import DashboardGraph from "./dashboard/DashboardGraph";
import DashboardOverview from "./dashboard/DashboardOverview";
import LineChartGraph from "./dashboard/LineChartGraph";
import TestCaseTable from "./dashboard/TestCaseTable";
import AgentHealth from "./dashboard/AgentHealth";
import { exportToCSV } from "./dashboard/CSVExporter";


// Types
interface Persona {
  personaName: string;
  passed: number;
  failed: number;
}
interface Overview {
  agentCount: number;
  personaCount: number;
  testCases: number;
  passed: number;
  failed: number;
}
interface Agent {
  agentName: string;
  agentID: string;
  health: string;
  lastRun: string;
}
interface TestRun {
  id: string;
  agentName: string;
  agentId: string;
  chats: any[];
}
interface DashboardData {
  pieChartData: Persona[];
  overview: Overview;
  agentList: Agent[];
  testRunHistory: TestRun[];
  testRun: any[];
}

const personaColors = ["#4CAF50", "#2196F3", "#FF9800", "#92a1ee", "#b0a1b0"];
const outerColors = {
  Passed: "#81C784",
  Failed: "#EF5350",
};

let agentData: any[] = [];

export default function DashboardCharts() {
  const [activeInnerIndex, setActiveInnerIndex] = useState<number | null>(null);
  const [activeOuterIndex, setActiveOuterIndex] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [agentDropdownData, setAgentDropdownData] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<Overview | null>(null);
  const [agentHealth, setAgentHealthData] = useState<any[]>([]);

  const handleInnerEnter = (_: any, index: number) => setActiveInnerIndex(index);
  const handleInnerLeave = () => setActiveInnerIndex(null);
  const handleOuterEnter = (_: any, index: number) => setActiveOuterIndex(index);
  const handleOuterLeave = () => setActiveOuterIndex(null);

  const handleLoadAgent = async (agentID: string) => {
    setSelectedAgent(agentID);
    setLoading(true);
    try {
      let url = agentID === "all"
        ? "/api/tools/agent-dashboard"
        : `/api/tools/agent-dashboard/testDetials?id=${agentID}`;
      const res = await fetch(url);
      const data = await res.json();
      if (agentID === "all") {
        setDashboardData(data.data);
        setAgentDropdownData(data.data.agentData);
        setOverviewData(data.data.overview);
        setAgentHealthData(data.data.agentHealthData || []);
      } else {
        setDashboardData(prev => prev && {
          ...prev,
          pieChartData: data.data.pieChartData,
          testRunHistory: data.data.testRunHistory,
          testRun: data.data.testRun,
        });
      }
    } catch (e) {
      console.log("error calling the api", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchAgentsData = async () => {
      fetch(`/api/tools/agent-dashboard`)
        .then(res => res.json())
        .then(data => {
          setDashboardData(data.data);
          setAgentDropdownData(data.data.agentData || data.data.agentList || []);
          setOverviewData(data.data.overview);
          setAgentHealthData(data.data.agentHealthData || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    fetchAgentsData();
  }, []);

  if (loading || !dashboardData) {
    return <div style={{ padding: 40, textAlign: "center" }}><Loader /></div>;
  }

  const { pieChartData, agentList, testRunHistory, testRun } = dashboardData;

  const innerData = pieChartData.map((persona: Persona) => ({
    name: persona.personaName,
    value: persona.passed + persona.failed,
  }));
  const outerData = pieChartData.flatMap((persona: Persona) => [
    {
      name: `${persona.personaName} - Passed`,
      value: persona.passed,
      persona: persona.personaName,
      type: "Passed",
    },
    {
      name: `${persona.personaName} - Failed`,
      value: persona.failed,
      persona: persona.personaName,
      type: "Failed",
    }
  ]);

  const filteredAgentList = selectedAgent === "all"
    ? agentList
    : agentList.filter((agent: Agent) => agent.agentID === selectedAgent);

  const passedCount = testRunHistory?.filter((chat: any) => chat.status === 'passed').length || 0;
  const failedCount = testRunHistory?.filter((chat: any) => chat.status === 'failed').length || 0;

  const handleExport = () => {
    exportToCSV(outerData, 'TestResults');
  };

  return (

    <div>
      <div style={{ display: "flex", gap: "20px", padding: 20 }}>
        <div style={{ flex: "0 0 20%" }}>
          <div className="w-full rounded-xl p-5 shadow-md font-sans flex flex-col gap-5 h-[445px]">
            <DashboardOverview overview={overviewData} />
            {/* <div className=""> */}
              {/* <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200"
              >
                Export
              </button> */}
            {/* </div> */}
          </div>

        </div>

        <div style={{ flex: "0 0 35%" }}>
          <div className="w-full rounded-xl p-5 shadow-md font-sans flex flex-col gap-5 h-[445px]">
            <DashboardGraph
              innerData={innerData}
              outerData={outerData}
              activeInnerIndex={activeInnerIndex}
              activeOuterIndex={activeOuterIndex}
              handleInnerEnter={handleInnerEnter}
              handleInnerLeave={handleInnerLeave}
              handleOuterEnter={handleOuterEnter}
              handleOuterLeave={handleOuterLeave}
              agentList={agentDropdownData}
              selectedAgent={selectedAgent}
              handleLoadAgent={handleLoadAgent}
            />
          </div>
        </div>

        <div style={{ flex: "0 0 43.5%" }}>
          <div className="w-full rounded-xl p-5 shadow-md font-sans flex flex-col gap-5 h-[445px]">
            <AgentTable agentList={filteredAgentList} />
          </div>
        </div>
      </div>

      {selectedAgent !== 'all' && (
        <div style={{ display: "flex", gap: "20px", padding: '0px 20px 20px 20px' }}>
          <div
            className="w-full rounded-xl pt-5 pr-5 pb-5 pl-5 shadow-md font-sans flex flex-col gap-5"
            style={{ height: '370px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-lg font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Test Run Summary
                <img
                  src="/information.png"
                  alt="Info"
                  title="This graph shows the number of passed and failed test cases for the selected agent over the last 5 test runs."
                  className="h-8 drop-shadow-lg"
                />
              </span>
              <PassFailBar passed={passedCount} failed={failedCount} />
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
              <div style={{ flex: '0 0 35%', height: '100%' }}>
                <LineChartGraph testRun={testRun} />
              </div>

              <div style={{ flex: '0 0 65%', height: '100%', overflowY: 'auto' }}>
                <TestCaseTable testRunHistory={testRunHistory} selectedAgent={selectedAgent} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAgent === 'all' && (
        <div style={{ gap: "20px", padding: '0px 10px 20px 20px' }}>
          {/* <div style={{ flex: "0 0 100%" }}> */}
          <div className="w-full rounded-xl p-5 shadow-md font-sans flex flex-col gap-5 h-[370px]">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-lg font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Agent Health History
                <img
                  src="/information.png"
                  alt="Info"
                  title="This data shows the Agent Health and Hallucination Rate Across the Last 5 Test Runs with Corresponding Dates."
                  className="h-7 drop-shadow-lg"
                />
              </span>
            </div>
            <AgentHealth agentHealth={agentHealth} />
            {/* </div> */}
          </div>

        </div>

      )}
    </div>

  );
}


const PassFailBar = ({ label, passed, failed }: any) => {
  const total = passed + failed;
  const passWidth = (passed / total) * 100;
  const failWidth = (failed / total) * 100;

  return (
    <div style={{ width: '100%', maxWidth: '300px' }}>
      <div style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>{label}</div>
      <div style={{ display: 'flex', height: '10px', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          style={{ width: `${passWidth}%`, backgroundColor: '#4CAF50' }}
          title={`Passed: ${passed}`}
        />
        <div
          style={{ width: `${failWidth}%`, backgroundColor: '#F44336' }}
          title={`Failed: ${failed}`}
        />
      </div>
    </div>
  );
};