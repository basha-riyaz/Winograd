'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';

export default function TestCaseTable({ testRunHistory, selectedAgent }: any) {
  const [sortState, setSortState] = useState<true | false | null>(null); // null = original
  const [originalOrder, setOriginalOrder] = useState<any[]>([]); // stores unmodified order

  const columnStyles = {
    scenario: { width: '25vw' },
    hallucination: { width: '6vw' },
    persona: { width: '10vw' },
    timeTaken: { width: '9vw', textAlign: 'center' }
  };

  // Preserve initial order when data changes
  useEffect(() => {
    if (testRunHistory?.length) {
      setOriginalOrder(testRunHistory);
    }
  }, [testRunHistory]);

  // Sorting logic
  const sortedTestRunHistory = useMemo(() => {
    if (!testRunHistory || sortState === null) {
      return originalOrder;
    }
    return [...testRunHistory].sort((a, b) => {
      if (sortState) {
        return a.status.localeCompare(b.status); // ascending
      } else {
        return b.status.localeCompare(a.status); // descending
      }
    });
  }, [testRunHistory, sortState, originalOrder]);

  const toggleSort = () => {
    setSortState(prev =>
      prev === null ? true : prev === true ? false : null
    );
  };

  return (
    <div className="h-full flex flex-col">
      {selectedAgent !== 'all' && (
        <div className="sticky top-0 z-20">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#d3d3d3] sticky top-0 z-20 hover:bg-[#9f9e9e]">
                <TableHead
                  className="text-black dark:text-white text-lg font-bold cursor-pointer flex items-center gap-2"
                  style={columnStyles.scenario}
                  onClick={toggleSort}
                >
                  <span>Test Case</span>
                  <ArrowUpDown
                    className={`w-4 h-4 transition-transform ${
                      sortState === true
                        ? 'rotate-180 text-blue-600'
                        : sortState === false
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  />
                </TableHead>
                <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.hallucination}>
                  Hallucination
                </TableHead>
                <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.persona}>
                  Persona
                </TableHead>
                <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.timeTaken}>
                  Time Taken(ms)
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableBody>
            {selectedAgent === 'all' ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-5 text-muted-foreground">
                  {/* No Agent Selected */}
                </TableCell>
              </TableRow>
            ) : sortedTestRunHistory.length > 0 ? (
              sortedTestRunHistory.map((chat: any, idx: number) => (
                <TableRow
                  key={chat.personaId + idx}
                  className={`cursor-pointer text-base font-medium transition-colors w-[15vw] ${
                    idx % 2 === 1 ? 'bg-[#eceff2]' : 'bg-white'
                  } hover:bg-[#e6f4ea]`}
                  style={{ fontSize: '1.15rem' }}
                >
                  <TableCell className="flex items-center gap-2 font-medium" style={columnStyles.scenario}>
                    <span style={{ minWidth: 25, display: 'inline-block', textAlign: 'center' }}>
                      {chat.status === 'passed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </span>
                    <span title={chat.scenarioName}>
                      {chat.scenarioName.length > 80
                        ? `${chat.scenarioName.slice(0, 80)}...`
                        : chat.scenarioName}
                    </span>
                  </TableCell>
                  <TableCell style={columnStyles.hallucination}>
                    <span className={chat.hallucination ? 'blinking-red' : ''} >
                      {chat.hallucination ? 'Detected' : 'None'}</span>
                    </TableCell>
                  <TableCell style={columnStyles.persona}>{chat.personaName}</TableCell>
                  <TableCell style={columnStyles.timeTaken}>{chat.responseTime}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-5 text-muted-foreground">
                  No Test Cases Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    // <div className="h-full flex flex-col">
    //   <div className="sticky top-0 z-20">
    //     <Table>
    //       <TableHeader>
    //         <TableRow className="bg-[#d3d3d3] sticky top-0 z-20 hover:bg-[#9f9e9e]">
    //           <TableHead
    //             className="text-black dark:text-white text-lg font-bold cursor-pointer flex items-center gap-2"
    //             style={columnStyles.scenario}
    //             onClick={toggleSort}
    //           >
    //             <span>Test Case</span>
    //             <ArrowUpDown
    //               className={`w-4 h-4 transition-transform ${
    //                 sortState === true
    //                   ? 'rotate-180 text-blue-600'
    //                   : sortState === false
    //                   ? 'text-blue-600'
    //                   : 'text-gray-500'
    //               }`}
    //             />
    //           </TableHead>
    //           <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.hallucination}>
    //             Hallucination
    //           </TableHead>
    //           <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.persona}>
    //             Persona
    //           </TableHead>
    //           <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.timeTaken}>
    //             Time Taken(ms)
    //           </TableHead>
    //         </TableRow>
    //       </TableHeader>
    //     </Table>
    //   </div>

    //   {/* Scrollable Table Body */}
    //   <div className="flex-1 overflow-y-auto">
    //     <Table>
    //       <TableBody>
    //         {selectedAgent === 'all' ? (
    //           <TableRow>
    //             <TableCell colSpan={4} className="text-center py-5 text-muted-foreground">
    //               No Agent Selected
    //             </TableCell>
    //           </TableRow>
    //         ) : sortedTestRunHistory.length > 0 ? (
    //           sortedTestRunHistory.map((chat: any, idx: number) => (
    //             <TableRow
    //               key={chat.personaId + idx}
    //               className={`cursor-pointer text-base font-medium transition-colors w-[15vw] ${
    //                 idx % 2 === 1 ? 'bg-[#eceff2]' : 'bg-white'
    //               } hover:bg-[#e6f4ea]`}
    //               style={{ fontSize: '1.15rem' }}
    //             >
    //               <TableCell className="flex items-center gap-2 font-medium" style={columnStyles.scenario}>
    //                 <span style={{ minWidth: 25, display: 'inline-block', textAlign: 'center' }}>
    //                   {chat.status === 'passed' ? (
    //                     <CheckCircle2 className="w-5 h-5 text-green-600" />
    //                   ) : (
    //                     <XCircle className="w-5 h-5 text-red-600" />
    //                   )}
    //                 </span>
    //                 <span title={chat.scenarioName}>
    //                   {chat.scenarioName.length > 80
    //                     ? `${chat.scenarioName.slice(0, 80)}...`
    //                     : chat.scenarioName}
    //                 </span>
    //               </TableCell>
    //               <TableCell style={columnStyles.hallucination}>Detected</TableCell>
    //               <TableCell style={columnStyles.persona}>{chat.personaName}</TableCell>
    //               <TableCell style={columnStyles.timeTaken}>{chat.responseTime}</TableCell>
    //             </TableRow>
    //           ))
    //         ) : (
    //           <TableRow>
    //             <TableCell colSpan={4} className="text-center py-5 text-muted-foreground">
    //               No Test Cases Found
    //             </TableCell>
    //           </TableRow>
    //         )}
    //       </TableBody>
    //     </Table>
    //   </div>
    // </div>
  );
}





// import React from 'react';
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell
// } from '@/components/ui/table';
// import { CheckCircle2, XCircle } from 'lucide-react';

// export default function TestCaseTable({ testRunHistory, selectedAgent }: any) {
//   const columnStyles = {
//     scenario: { width: '25vw' },
//     hallucination: { width: '6vw' },
//     persona: { width: '10vw' },
//     timeTaken: { width: '9vw', textAlign: 'center' }
//   };

//   return (
//     <div className="h-full flex flex-col">
//       <div className="sticky top-0 z-20">
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-[#d3d3d3] sticky top-0 z-20 hover:bg-[#9f9e9e]">
//               <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.scenario}>
//                 Test Case
//               </TableHead>
//               <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.hallucination}>
//                 Hallucination
//               </TableHead>
//               <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.persona}>
//                 Persona
//               </TableHead>
//               <TableHead className="text-black dark:text-white text-lg font-bold" style={columnStyles.timeTaken}>
//                 Time Taken(ms)
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//         </Table>
//       </div>

//       <div className="flex-1 overflow-y-auto">
//         <Table>
//           <TableBody>
//             {selectedAgent === 'all' ? (
//               <TableRow>
//                 <TableCell colSpan={4} className="text-center py-5 text-muted-foreground">
//                   No Agent Selected
//                 </TableCell>
//               </TableRow>
//             ) : testRunHistory?.length > 0 ? (
//               testRunHistory.map((chat: any, idx: number) => (
//                 <TableRow
//                   key={chat.personaId + idx}
//                   className={`cursor-pointer text-base font-medium transition-colors w-[15vw] ${idx % 2 === 1 ? 'bg-[#eceff2]' : 'bg-white'
//                     } hover:bg-[#e6f4ea]`}
//                   style={{ fontSize: '1.15rem' }}
//                 >
//                   <TableCell className="flex items-center gap-2 font-medium" style={columnStyles.scenario}>
//                     <span style={{ minWidth: 25, display: 'inline-block', textAlign: 'center' }}>
//                       {chat.status === 'passed' ? (
//                         <CheckCircle2 className="w-5 h-5 text-green-600" />
//                       ) : (
//                         <XCircle className="w-5 h-5 text-red-600" />
//                       )}
//                     </span>
//                     <span title={chat.scenarioName}>
//                       {chat.scenarioName.length > 80
//                         ? `${chat.scenarioName.slice(0, 80)}...`
//                         : chat.scenarioName}
//                     </span>
//                   </TableCell>
//                   <TableCell style={columnStyles.hallucination}>Detected</TableCell>
//                   <TableCell style={columnStyles.persona}>{chat.personaName}</TableCell>
//                   <TableCell style={columnStyles.timeTaken}>{chat.responseTime}</TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={4} className="text-center py-5 text-muted-foreground">
//                   No Test Cases Found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }


