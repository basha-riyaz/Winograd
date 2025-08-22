import { withApiHandler } from '@/lib/api-utils';
import { NotFoundError, ValidationError, ExternalAPIError } from '@/lib/errors';
import { dbService } from '@/services/db';
import { QaAgent } from '@/services/agents/claude/qaAgent';
import { v4 as uuidv4 } from 'uuid';
import { TestRun } from '@/types/runs';
import { Conversation } from '@/types/chat';
import { Rule } from '@/services/agents/claude/types';
import { LLMProvider } from '@/services/llm/enums';
import { createTestRunSchema, safeValidateRequest } from '@/lib/validations/api';
import { agentConfigService } from '@/services/db/agentConfigService'; //manasa

//manasa-s
// Updated status calculation logic (inverted)
const STATUS_CONFIG = {
  thresholds: {
    High: 0.2,    // If pass rate <= 20% → Status = High
    Medium: 0.4,  // If pass rate <= 40% → Status = Medium
    Moderate: 0.6,// If pass rate <= 60% → Status = Moderate
    Low: 0.8      // If pass rate <= 80% → Status = Low
  },
  weights: {
    High: 3,      // Higher weight for worse performance
    Medium: 2,
    Moderate: 1,
    Low: 0        // Lowest weight for best performance
  }
};

function calculateAgentStatus(conversations: Conversation[]): string {
  const personaStats = new Map<string, { total: number; passed: number }>();

  // Aggregate pass/fail stats per persona
  conversations.forEach(conv => {
    if (!conv.personaName) return;
    const persona = conv.personaName.trim();
    const stats = personaStats.get(persona) || { total: 0, passed: 0 };
    stats.total++;
    if (conv.status === 'passed') stats.passed++;
    personaStats.set(persona, stats);
  });

  // Classify personas (INVERTED LOGIC)
  const classifications = new Map<string, keyof typeof STATUS_CONFIG.weights>();
  personaStats.forEach((stats, persona) => {
    const passRate = stats.passed / stats.total;
    let classification: keyof typeof STATUS_CONFIG.weights;

    if (passRate <= STATUS_CONFIG.thresholds.High) {
      classification = 'High'; // Worst performance → Highest status
    } else if (passRate <= STATUS_CONFIG.thresholds.Medium) {
      classification = 'Medium';
    } else if (passRate <= STATUS_CONFIG.thresholds.Moderate) {
      classification = 'Moderate';
    } else {
      classification = 'Low'; // Best performance → Lowest status
    }

    classifications.set(persona, classification);
  });

  // Calculate weighted average (weights already reflect inverted logic)
  let totalWeight = 0;
  classifications.forEach(status => {
    totalWeight += STATUS_CONFIG.weights[status];
  });

  const average = totalWeight / classifications.size;
  

  // Determine overall agent status (INVERTED)
  if (average >= STATUS_CONFIG.weights.High) return 'High';
  if (average >= STATUS_CONFIG.weights.Medium) return 'Medium';
  if (average >= STATUS_CONFIG.weights.Moderate) return 'Moderate';
  return 'Low';
}


// Helper to log pass/fail rate per persona
function logPersonaPassRates(chats: Conversation[]) {
  const personaStats = new Map<string, { total: number; passed: number }>();
  chats.forEach(conv => {
    if (!conv.personaName) return;
    const persona = conv.personaName.trim();
    const stats = personaStats.get(persona) || { total: 0, passed: 0 };
    stats.total++;
    if (conv.status === 'passed') stats.passed++;
    personaStats.set(persona, stats);
  });

  personaStats.forEach((stats, persona) => {
    const passRate = stats.total > 0 ? (stats.passed / stats.total) : 0;
    console.log(`Persona: ${persona} | Passed: ${stats.passed} / ${stats.total} | Pass Rate: ${(passRate * 100).toFixed(2)}%`);
  });
}

export const GET = withApiHandler(async (request: Request) => {
  // Parse query parameters for pagination
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  // Return paginated test runs
  const result = await dbService.getAllTestRuns(limit, offset);
  
  return result;
});

export const POST = withApiHandler(async (request: Request) => {

  const body = await request.json();
  console.log('body============:((', body);
  const validation = safeValidateRequest(createTestRunSchema, body);
  if (!validation.success) {
    throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
  }

  const { testId } = validation.data;
  console.log('testId============:((', testId);
  // Setup API key configuration
  const apiKey = request.headers.get("x-api-key");
  console.log('apiKey============:((', apiKey);
  const modelId = request.headers.get("x-model") || "";
  console.log('modelId============:((', modelId);
  const provider = request.headers.get("x-provider") || LLMProvider.Anthropic;
  console.log('provider============:((', provider);
  const extraParamsStr = request.headers.get("x-extra-params");
  console.log('extraParamsStr============:((', extraParamsStr);

  let extraParams = {};
  if (extraParamsStr) {
    try {
      extraParams = JSON.parse(extraParamsStr);
    } catch (e) {
      throw new ValidationError(`Invalid extra params: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (!apiKey) {
    throw new ValidationError('API key is missing. Please configure in settings.');
  }

  // Fetch all the necessary data
  const testConfig = await dbService.getAgentConfigAll(testId);
  console.log('testConfig============:((', testConfig);
  if (!testConfig) {
    throw new NotFoundError('Test configuration not found');
  }

  const personaMapping = await dbService.getPersonaMappingByAgentId(testId);
  console.log('personaMapping============:((', personaMapping);
  const testVariations = await dbService.getTestVariations(testId);
  console.log('testVariations============:((', testVariations);
  const scenarios = testVariations.testCases;
  console.log('scenarios============:((', scenarios);
  const selectedPersonas = personaMapping.personaIds || [];
  console.log('selectedPersonas============:((', selectedPersonas);
  const enabledScenarios = scenarios.filter(scenario => scenario.enabled !== false);
  console.log('enabledScenarios============:((', enabledScenarios);
  const totalRuns = enabledScenarios.length * selectedPersonas.length;
  console.log('totalRuns============:((', totalRuns);

  // Create test run record FIRST
  const testRun: TestRun = {
    id: uuidv4(),
    name: testConfig.name,
    timestamp: new Date().toISOString(),
    status: 'running' as const,
    metrics: {
      total: totalRuns,
      passed: 0,
      failed: 0,
      chats: totalRuns,
      correct: 0,
      incorrect: 0
    },
    chats: [],
    results: [],
    agentId: testId,
    createdBy: 'system'
  };
  
  // Save the test run to the database immediately
  await dbService.createTestRun(testRun);

  // Format rules for the agent
  const formattedRules: Rule[] = testConfig.rules.map(rule => ({
    id: uuidv4(),
    path: rule.path,
    condition: rule.condition,
    value: rule.value,
    description: rule.description || "",
    isValid: true
  }));

  // Convert inputFormat to Record<string, any>
  const inputFormat: Record<string, any> =
    typeof testConfig.inputFormat === 'object' ?
      testConfig.inputFormat as Record<string, any> :
      {};

  const completedChats: Conversation[] = [];

  // Create test conversations BEFORE running the tests
  for (const scenario of enabledScenarios) {
    for (const personaId of selectedPersonas) {
      // Create the test conversation record in the database BEFORE running the test
      const conversationId = await dbService.createTestConversation({
        runId: testRun.id,
        scenarioId: scenario.id,
        personaId: personaId,
        status: 'running'
      });

      try {
        const agent = new QaAgent({
          headers: testConfig.headers,
          modelId,
          provider,
          endpointUrl: testConfig.endpoint,
          apiConfig: {
            inputFormat: inputFormat,
            outputFormat: typeof testConfig.latestOutput?.responseData === 'object' ?
              testConfig.latestOutput.responseData as Record<string, any> :
              {},
            rules: formattedRules
          },
          persona: personaId,
          userApiKey: apiKey,
          extraParams,
          // Pass the conversation ID created above to ensure all messages use the same ID
          conversationId: conversationId,
          agentDescription: testConfig.agentDescription
        });

        const result = await agent.runTest(
          scenario.scenario,
          scenario.expectedOutput || ''
        ).catch(err => {
          throw new ExternalAPIError(
            `Failed to run test: ${err instanceof Error ? err.message : String(err)}`,
            err
          );
        });

        const agentMetrics = await dbService.getMetricsForAgent(testId);
        const conversationValidation = await agent.validateFullConversation(
          result.conversation.allMessages
            .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
            .join('\n\n'),
          scenario.scenario,
          scenario.expectedOutput || '',
          agentMetrics
        ).catch(err => {
          console.log(`Failed to validate conversation: ${err instanceof Error ? err.message : String(err)}`, err)
        });

        const chat: Conversation = {
          id: conversationId,
          scenarioName: scenario.scenario,
          personaName: personaId,
          name: scenario.scenario,
          scenario: scenario.id,
          status: conversationValidation?.isCorrect ? 'passed' : 'failed',
          messages: result.conversation.allMessages,
          metrics: {
            correct: conversationValidation?.isCorrect ? 1 : 0,
            incorrect: conversationValidation?.isCorrect ? 0 : 1,
            responseTime: [result.validation.metrics.responseTime],
            contextRelevance: [1],
            validationDetails: {
              customFailure: !conversationValidation?.isCorrect,
              containsFailures: [],
              notContainsFailures: []
            },
            metricResults: conversationValidation?.metrics || []
          },
          timestamp: new Date().toISOString(),
          personaId: personaId,
          validationResult: conversationValidation
        };

        // Update the test conversation's status to 'passed' or 'failed' with validation data
        await dbService.updateTestConversationStatus(
          conversationId,
          conversationValidation?.isCorrect ? 'passed' : 'failed',
          undefined, // no error message for successful runs
          conversationValidation // pass the validation result to be saved
        );

        completedChats.push(chat);
        testRun.metrics.passed += conversationValidation?.isCorrect ? 1 : 0;
        testRun.metrics.failed += conversationValidation?.isCorrect ? 0 : 1;
        testRun.metrics.correct += conversationValidation?.isCorrect ? 1 : 0;
        testRun.metrics.incorrect += conversationValidation?.isCorrect ? 0 : 1;

      } catch (error) {
        // Update the test conversation's status to 'failed'
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Test execution failed for scenario ${scenario.scenario} with persona ${personaId}:`, error);
        await dbService.updateTestConversationStatus(conversationId, 'failed', errorMessage);

        const chat: Conversation = {
          id: conversationId,
          scenarioName: scenario.scenario,
          personaName: personaId,
          name: scenario.scenario,
          scenario: scenario.id,
          status: 'failed',
          messages: [],
          metrics: {
            correct: 0,
            incorrect: 0,
            responseTime: [],
            contextRelevance: [],
            metricResults: []
          },
          timestamp: new Date().toISOString(),
          error: errorMessage,
          personaId: personaId
        };

        completedChats.push(chat);
        testRun.metrics.failed += 1;
        testRun.metrics.incorrect += 1;
      }
    }
  }
  testRun.chats = completedChats;
  testRun.status = 'completed' as const;

  // Update the test run with final results
  await dbService.updateTestRun(testRun);

  // Calculate and update agent status
  //manasa-s
  //Updates agent status based on test results
  if (completedChats.length > 0) {
    logPersonaPassRates(completedChats); // <-- logs persona pass/fail rates
    const newStatus = calculateAgentStatus(completedChats); //caluculate agent status
    console.log('Calculated agent status:', newStatus);
    
    try {
      await agentConfigService.updateAgentStatus(testId,  '',newStatus);
    } catch (statusError) {
      console.error('Status update failed (non-critical):', statusError);
    }

    try {
      console.log('Updating agent health...', testRun.id, testId);
      await agentConfigService.updateAgentHealth(testRun.id, newStatus, testId);
    } catch (error) {
      console.error('Failed to update agent status:', error); 
    }
  }
  // ======= END OF STATUS UPDATE SECTION =======
  //manasa-e
  return testRun;
});