import { withApiHandler } from "@/lib/api-utils";
import { dbService } from "@/services/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { agentConfigSchema, safeValidateRequest } from "@/lib/validations/api";
import { conductanceQuantumDependencies } from "mathjs";

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const overview = {
    agentCount    : 0,
    personaCount  : 0,
    testCases     : 0,
    passed        : 0,
    failed        : 0,
  };
  let pieChartData      : any = [];
  let barGraphData      : any = [];
  let agentList         : any = []
  let agentData         : any = [];
  let agentHealthData   : any = [];


  let dashbaordParams = {
    overview,
    pieChartData,
    barGraphData,
    agentList,
    agentData,
    agentHealthData
  };
  
  let configs : any = []

  // if (id) {
  //   const config = await dbService.getAgentConfigAll(id);
  //   if (!config) {
  //     throw new NotFoundError("Agent not found");
  //   }
  //   return config;
  // }

  // Return all configs since we don't have user context
  configs = await dbService.getAllAgentConfigs();
  if (!configs) {
    console.error("No agent configurations found");
    // throw new NotFoundError('No agent configurations found');
  }
  configs = configs.filter((td: any)=>td.lastrun !== null)
  agentList  = configs.map((agent: any)=>{
    return {
      agentID: agent.id,
      agentName: agent.name,
      health: agent.agenthealth || '---',
      lastRun:agent.lastrun ? formatDate(agent.lastrun) : '---',
      agentStatus: agent.agentstatus,
      agentstatuscheck : agent.statuscheck
    }
  })

  agentData = configs.map((agent: any)=>{
    return {
      agentID: agent.id,
      agentName: agent.name,
      lastRun:agent.lastrun
    }
  })

  overview.agentCount = configs.length;
  // getting the personas count
  const personas = await dbService.getPersonas();
  if (!personas) {
    console.error("No personas found");
    // throw new NotFoundError('No personas found');
  }
  overview.personaCount = personas.length;
  // getting the test cases count
  const testcases = await dbService.getUniqueTestRuns();
  if (!testcases) {
    console.error("No test cases found");
    // throw new NotFoundError('No test cases found');
  }
  function summarizeMetrics(dataArray: any) {
    return dataArray.reduce(
      (summary: any, item: any) => {
        summary.total += item.total || 0;
        summary.passed += item.passed || 0;
        summary.failed += item.failed || 0;
        return summary;
      },
      { total: 0, passed: 0, failed: 0 }
    );
  }

  function formatDate(dateString: string) {
    console.log('dateString: ', dateString);
    const date = new Date(dateString);

    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  }
  
  const metrics = summarizeMetrics(testcases);
  overview.testCases = metrics.total;
  overview.passed = metrics.passed;
  overview.failed = metrics.failed;

  const uniqueTestRuns  =  testcases.map((val)=>val.id);

  let testconversion   = await dbService.getTestConversions(uniqueTestRuns);

  barGraphData = testcases.map((test : any)=>{
    return {
      agentName : test.name,
      passed : test.passed,
      failed : test.failed
    }
  })


  const uiqueAgents = agentData.map((agent: any)=> agent.agentID)

  const healthData = await dbService.getAgentHealthData(uiqueAgents);

  dashbaordParams.overview = overview;  
  dashbaordParams.barGraphData = barGraphData;
  dashbaordParams.pieChartData = testconversion;
  dashbaordParams.agentList = agentList;
  dashbaordParams.agentData = agentData || [];
  dashbaordParams.agentHealthData = healthData || [];


  // dashbaordParams.overview = {
  //     "agentCount": 3,
  //     "personaCount": 3,
  //     "testCases": 15,
  //     "passed": 9,
  //     "failed": 6
  //   };  
  // dashbaordParams.barGraphData = barGraphData;
  // dashbaordParams.pieChartData = [
  //     {
  //       "personaName": "Friendly User",
  //       "passed": 3,
  //       "failed": 1
  //     },
  //     {
  //       "personaName": "Technical Expert",
  //       "passed": 4,
  //       "failed": 2
  //     },
  //     {
  //       "personaName": "Confused User",
  //       "passed": 2,
  //       "failed": 3
  //     }
  //   ];
  // dashbaordParams.agentList = [
  //     {
  //       "agentID": "262e16b9-965d-489a-be56-b98eb9601f1e",
  //       "agentName": "PS Sales Agent",
  //       "health": "Moderate",
  //       "lastRun": "07-30-2025 10:23:03",
  //       "agentStatus": "ACTIVE",
  //       "agentstatuscheck": null
  //     },
  //     {
  //       "agentID": "b722e9fc-557f-45ab-bf57-1f8899e43ed8",
  //       "agentName": "Resume Skills Matcher",
  //       "health": "High",
  //       "lastRun": "07-30-2025 11:10:45",
  //       "agentStatus": "ACTIVE",
  //       "agentstatuscheck": null
  //     },
  //     {
  //       "agentID": "d46d9ab4-2f47-4f44-9bd6-637ed7a0198e",
  //       "agentName": "HRMS Agent",
  //       "health": "Low",
  //       "lastRun": "07-30-2025 09:05:30",
  //       "agentStatus": "ACTIVE",
  //       "agentstatuscheck": null
  //     }
  //   ];
  // dashbaordParams.agentData = [
  //     {
  //       "agentID": "262e16b9-965d-489a-be56-b98eb9601f1e",
  //       "agentName": "PS Sales Agent",
  //       "lastRun": "2025-07-30T04:53:03.231Z"
  //     },
  //     {
  //       "agentID": "b722e9fc-557f-45ab-bf57-1f8899e43ed8",
  //       "agentName": "Resume Skills Matcher",
  //       "lastRun": "2025-07-30T05:40:45.102Z"
  //     },
  //     {
  //       "agentID": "d46d9ab4-2f47-4f44-9bd6-637ed7a0198e",
  //       "agentName": "HRMS Agent",
  //       "lastRun": "2025-07-30T03:35:30.905Z"
  //     }
  //   ];
  // dashbaordParams.agentHealthData = [
  //     {
  //       "agent": "PS Sales Agent",
  //       "testRuns": [
  //         {
  //           "date": "2025-07-22",
  //           "health": "Moderate",
  //           "hallucinationRate": 10
  //         },
  //         {
  //           "date": "2025-07-26",
  //           "health": "High",
  //           "hallucinationRate": 70
  //         },
  //         {
  //           "date": "2025-07-28",
  //           "health": "High",
  //           "hallucinationRate": 75
  //         },
  //         {
  //           "date": "2025-07-31",
  //           "health": "Moderate",
  //           "hallucinationRate": 10
  //         },
  //         {
  //           "date": "2025-07-30",
  //           "health": "Moderate",
  //           "hallucinationRate": 30
  //         }
  //       ]
  //     },
  //     {
  //       "agent": "Resume Skills Matcher",
  //       "testRuns": [
  //          {
  //           "date": "2025-07-24",
  //           "health": "Medium",
  //           "hallucinationRate": 20
  //         },
  //         {
  //           "date": "2025-07-26",
  //           "health": "High",
  //           "hallucinationRate": 70
  //         },
  //         {
  //           "date": "2025-07-28",
  //           "health": "High",
  //           "hallucinationRate": 75
  //         },
  //         {
  //           "date": "2025-07-31",
  //           "health": "High",
  //           "hallucinationRate": 5
  //         },
  //         {
  //           "date": "2025-07-30",
  //           "health": "High",
  //           "hallucinationRate": 0
  //         }
  //       ]
  //     },
  //     {
  //       "agent": "HRMS Agent",
  //       "testRuns": [
  //          {
  //           "date": "2025-07-24",
  //           "health": "Moderate",
  //           "hallucinationRate": 10
  //         },
  //         {
  //           "date": "2025-07-26",
  //           "health": "High",
  //           "hallucinationRate": 70
  //         },
  //         {
  //           "date": "2025-07-28",
  //           "health": "High",
  //           "hallucinationRate": 75
  //         },
  //         {
  //           "date": "2025-07-31",
  //           "health": "Low",
  //           "hallucinationRate": 20
  //         },
  //         {
  //           "date": "2025-07-30",
  //           "health": "Low",
  //           "hallucinationRate": 10
  //         }
  //       ]
  //     }
  //   ];

  
  return dashbaordParams
});