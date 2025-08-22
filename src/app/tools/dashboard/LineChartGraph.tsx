import { CheckCircle2, XCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { date, passed, failed } = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'white', padding: 10, border: '1px solid #ccc', width: 200 }}>
        <p><strong>Last run : {label}</strong></p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Passed : {passed}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <XCircle className="w-5 h-5 text-red-600" />
          <span>Failed : {failed}</span>
        </div>
      </div>

    );
  }
  return null;
};

export default function LineChartGraph({testRun}:any) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={testRun}
          margin={{ top: 5, right: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="passed" stroke="#4CAF50" name="Passed" strokeWidth={2} />
          <Line type="monotone" dataKey="failed" stroke="#F44336" name="Failed" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
