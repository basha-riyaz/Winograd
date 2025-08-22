import { withApiHandler } from "@/lib/api-utils";
import { dbService } from "@/services/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { agentConfigSchema, safeValidateRequest } from "@/lib/validations/api";
import { conductanceQuantumDependencies } from "mathjs";

interface agentlist  {
  agentID: string
  agentName: string
  health: string
  lastRun: String
  agentStatus: any
  agentstatuscheck: any
}

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const overview = {
    agentCount: 0,
    personaCount: 0,
    testCases: 0,
    passed: 0,
    failed: 0,
  };
  let pieChartData: any = [];
  let barGraphData: any = [];
  let agentList: agentlist[] = [];
  let testRunHistory: {}[] = [];
  let testRun:any =[];
  let dashbaordParams = {
    pieChartData,
    agentList,
    testRunHistory,
    testRun
  };

  let configs: any = [];

  if (id) {
    configs = await dbService.getAgentConfigAll(id);
    if (!configs) {
      throw new NotFoundError("Agent not found");
    }

  }
  // else {
  //   // Return all configs since we don't have user context
  //   configs = await dbService.getAllAgentConfigs();
  //   if (!configs) {
  //     console.error("No agent configurations found");
  //     // throw new NotFoundError('No agent configurations found');
  //   }
  // }

  agentList.push({
      agentID: configs.id,
      agentName: configs.name,
      health: configs.agenthealth || '---',
      lastRun:configs.lastrun ? formatDate(configs.lastrun) : '---',
      agentStatus: configs.agentstatus,
      agentstatuscheck : configs.statuscheck
  })

  function formatDate(dateString: string) {
    console.log('dateString: ', dateString);
    const date = new Date(dateString);

    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;

  }
  //overview.agentCount = configs.length;
  // getting the personas count
  // const personas = await dbService.getPersonas();
  // if (!personas) {
  //   console.error("No personas found");
  //   // throw new NotFoundError('No personas found');
  // }
  //overview.personaCount = personas.length;
  // getting the test cases count
  const testcases = await dbService.getUniqueTestRun(agentList[0].agentName);
  if (!testcases) {
    console.error("No test cases found");
    // throw new NotFoundError('No test cases found');
  }
  // function summarizeMetrics(dataArray: any) {
  //   return dataArray.reduce(
  //     (summary: any, item: any) => {
  //       summary.total += item.total || 0;
  //       summary.passed += item.passed || 0;
  //       summary.failed += item.failed || 0;
  //       return summary;
  //     },
  //     { total: 0, passed: 0, failed: 0 }
  //   );
  // }

  // const metrics = summarizeMetrics(testcases);
  // overview.testCases = metrics.total;
  // overview.passed = metrics.passed;
  // overview.failed = metrics.failed;

 

  const uniqueTestRuns = testcases?.testrunhistory?.map((val:any) => val.id);

  const testconversion = await dbService.getTestConversions(uniqueTestRuns);

  // barGraphData = testcases.map((test: any) => {
  //   return {
  //     agentName: test.name,
  //     passed: test.passed,
  //     failed: test.failed,
  //   };
  // });
 // dashbaordParams.overview = overview;
  //dashbaordParams.barGraphData = barGraphData;
  dashbaordParams.pieChartData = testconversion;
  dashbaordParams.agentList = agentList;
  dashbaordParams.testRunHistory = testcases?.testrunhistory[0].chats || [];
  dashbaordParams.testRun = testcases?.testruns || [];
  return dashbaordParams;
});
