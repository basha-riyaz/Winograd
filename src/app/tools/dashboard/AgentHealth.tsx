import { BookText, HeartPulse, Percent } from "lucide-react";
import React from "react";
import { colors } from '@/config/features';
import { useRouter } from "next/navigation";

const healthColors = colors as any;

export default function HeatmapTable({ agentHealth }: any) {
  const router = useRouter();
  if (!agentHealth) {
    return null;
  }
  const allDates = Array.from(new Set(agentHealth.flatMap((d: any) => d.testRuns.map((t: any) => t.date)))).sort();
  return (
    <>
      <style>
        {`
          .heatmap-container {
              overflow-x: auto;
              overflow-y: auto;
              font-family: sans-serif;
              max-width: 85vw;   /* FIX the container width */
              border-radius: 8px;
              height:239px;
          }

          .heatmap-table {
              width: 85vw;           /* FIX the table width */
              table-layout: fixed;    /* Equal-width columns */
              border-collapse: collapse;
              text-align: center;
              font-size: 14px;
              user-select: none;
              border-collapse: separate;
              border-spacing: 10px;
                border-radius: 8px;
          }

          .heatmap-table th,
          .heatmap-table td {
              padding: 12px 8px;
              // border: 1px solid #ddd;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              vertical-align: middle;
                border-radius: 8px;
          }

          .heatmap-table th {
              font-weight: 700;
              background: #f9f9f9;
              color: #333;
              position: sticky;
              top: 0;
              z-index: 10;
              user-select: none;
          }

          .heatmap-table th[colspan] {
              background-color: #eeeff0;
              font-size: 15px;
          }

          .agent-col {
              text-align: left;
              background: #eeeff0;
              font-weight: 600;
              color: #333;
              white-space: nowrap;
              width: 200px;
              user-select: text;
          }

          .heatmap-cell {
              border-radius: 6px;
              color: #000;
              font-weight: 600;
              transition: background-color 0.3s ease;
              cursor: default;
          }

          /* Better contrast text colors for readability */
          .heatmap-cell[data-tooltip*="High"] {
              color: #fff;
              background: #e53935; /* red */
              box-shadow: inset 0 0 10px rgba(255, 0, 0, 0.4);
          }

          .heatmap-cell[data-tooltip*="Moderate"] {
              color: #000;
              background: #ffb300; /* amber */
              box-shadow: inset 0 0 10px rgba(255, 176, 0, 0.4);
          }

          .heatmap-cell[data-tooltip*="Medium"] {
              color: #000;
              background: #fff176; /* yellow */
              box-shadow: inset 0 0 10px rgba(255, 241, 118, 0.4);
          }

          .heatmap-cell[data-tooltip*="Low"] {
              color: #000;
              background: #81c784; /* green */
              box-shadow: inset 0 0 10px rgba(129, 199, 132, 0.4);
          }

          .heatmap-cell:hover {
              filter: brightness(85%);
          }

          .heatmap-cell:hover::after {
              content: attr(data-tooltip);
              position: absolute;
              top: -30px;
              left: 50%;
              transform: translateX(-50%);
              background: #333;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
              z-index: 10;
              pointer-events: none;
          }

          .heatmap-legend {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              font-size: 16px;
              margin-top: 0;
              // max-width: 1500px;
              user-select: none;
          }

          .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
          }

          .legend-color {
              width: 30px;
              height: 20px;
              border-radius: 4px;
              box-shadow: 0 0 5px rgba(0,0,0,0.1);
          }
      `}
      </style>

      {/* {agentHealth?.length && ( */}
      <div className="heatmap-container">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th rowSpan={1} style={{ width: '15vw', backgroundImage: 'linear-gradient(to right, #f9f0f0, #c2f9c4, #f9f0f0)' }}>Agent</th>
              <th colSpan={5}>Health and Hallucination Rate </th>
            </tr>
            {/* <tr>
              {allDates.map((date) => (
                <th key={date}>{date}</th>
              ))}
            </tr> */}
          </thead>
          <tbody>
            {agentHealth.map((agentRow: any, rowIndex: any) => {
              const testRuns = agentRow.testRuns.slice(0, 5); // max 5 runs
              const paddedRuns = [...testRuns];

              while (paddedRuns.length < 5) {
                paddedRuns.push(null);
              }

              return (
                <tr key={rowIndex} style={{ marginBottom: '10px' }}>
                  <td className="agent-col transition-all duration-300 hover:scale-105 hover:shadow-1xl">
                    {agentRow.agent}
                  </td>
                  {paddedRuns.map((run, colIndex) => {
                    if (!run) {
                      return (
                        <td
                          key={colIndex}
                          style={{ backgroundColor: "#f5f5f5" }}
                        >
                          -
                        </td>
                      );
                    }

                    return (
                      // <td
                      //   onClick={() => router.push('/tools/runs?id=' + run.id)}
                      //   key={colIndex}
                      //   className="heatmap-cell transition-all duration-300 hover:scale-105 hover:shadow-1xl"
                      //   style={{ backgroundColor: healthColors[run.health], cursor: 'pointer', position: 'relative' }}
                      //   title = "Click here to see test run details"
                      // >
                      //   {run.date} ({run.hallucinationRate}%)
                      // </td>
                      <td
                        onClick={() => router.push('/tools/runs?id=' + run.id)}
                        key={colIndex}
                        className="heatmap-cell transition-all duration-300 hover:scale-105 hover:shadow-1xl"
                        style={{
                          cursor: 'pointer',
                          position: 'relative',
                          padding: 0,            
                          borderRadius: '8px',
                          overflow: 'hidden',
                          height: '45px',          
                        }}
                        title="Click here to see test run details"
                      >
                        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                          <div
                            style={{
                              flex: 2,
                              backgroundColor: healthColors[run.health] ? healthColors[run.health] : '#eeeff0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              gap: 4,
                            }}
                          >
                            <HeartPulse size={18} style={{ marginRight: 4, color: '#333', opacity: 0.7 }} />
                            {run.date}
                          </div>

                          <div
                            style={{
                              flex: 1,
                              backgroundColor: healthColors[run.hallucination] ? healthColors[run.hallucination] : '#eeeff0',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              marginLeft: '2px',
                              gap: 2,
                            }}
                          >
                            {run.hallucinationRate}<Percent size={18} style={{ marginRight: 2, color: '#fff', opacity: 0.8 }} />
                            
                          </div>
                        </div>
                      </td>

                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="heatmap-legend">     
        <LegendItem color={healthColors['High']} label="High" />
        <LegendItem color={healthColors['Moderate']} label="Moderate" />
        <LegendItem color={healthColors['Medium']} label="Medium" />
        <LegendItem color={healthColors['Low']} label="Low" />   
        {/* <strong>Agent Health : </strong>
        <LegendItem color={healthColors['High']} label="High" />
        <LegendItem color={healthColors['Moderate']} label="Moderate" />
        <LegendItem color={healthColors['Medium']} label="Medium" />
        <LegendItem color={healthColors['Low']} label="Low" />
        <strong className = 'ml-10'>Hallucination : </strong>
        <LegendItem color={healthColors['High']} label="High" />
        <LegendItem color={healthColors['Moderate']} label="Moderate" />
        <LegendItem color={healthColors['Low']} label="Low" /> */}
      </div>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="legend-item">
      <div className="legend-color" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
