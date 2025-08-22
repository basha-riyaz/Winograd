import cron from 'node-cron';
import axios from 'axios';
import { dbService } from "@/services/db";



const checkAgentStatus = async (agent: any): Promise<'ACTIVE' | 'INACTIVE'> => {
  try {
    const url  = agent.endpoint;
    const data =  agent.inputdata;
    
    const response = await axios.post(url, data);
    return response.status === 200 ? 'ACTIVE' : 'INACTIVE';
  } catch (error: any) {
    console.error('Error checking agent:', error.message);
    return 'INACTIVE';
  }
};

cron.schedule('* 14 * * *', async () => {
  const agentList  = await dbService.getAllAgentConfigs();
  console.table(agentList);
  agentList.forEach(async (data)=>{
    const status = await checkAgentStatus(data);
    console.log(`[${new Date().toString()}], Name :${data.name} ; Agent status: ${status}`);
    await dbService.updateAgentStatus(data.id,status, '');

  })
  
  
});