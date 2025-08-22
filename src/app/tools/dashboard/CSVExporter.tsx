
export const exportToCSV = (data: any[], fileName = 'export') => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }
  console.log('Exporting data:', data);

};
