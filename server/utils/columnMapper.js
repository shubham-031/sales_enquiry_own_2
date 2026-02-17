// Helper function to find value in row by checking multiple possible column names
export const findValueInRow = (row, ...possibleNames) => {
  // Try exact match first
  for (const name of possibleNames) {
    const value = row[name];
    if (value !== undefined && value !== null && value !== '' && value !== '-') {
      return value;
    }
  }
  
  // Try case-insensitive search
  const rowKeys = Object.keys(row);
  for (const name of possibleNames) {
    const lowerName = name.toLowerCase();
    const matchingKey = rowKeys.find(key => key.toLowerCase() === lowerName);
    if (matchingKey) {
      const value = row[matchingKey];
      if (value !== undefined && value !== null && value !== '' && value !== '-') {
        return value;
      }
    }
  }
  
  // Try fuzzy match (remove spaces, dots, special chars)
  const normalize = (str) => str.toLowerCase().replace(/[\s.\-_/]/g, '');
  for (const name of possibleNames) {
    const normalizedName = normalize(name);
    const matchingKey = rowKeys.find(key => normalize(key) === normalizedName);
    if (matchingKey) {
      const value = row[matchingKey];
      if (value !== undefined && value !== null && value !== '' && value !== '-') {
        return value;
      }
    }
  }
  
  return null;
};

// Column mapping configuration based on the actual Excel structure
// Updated to match the exact 16 columns from Sales Enquiry Tracker Excel
export const COLUMN_MAPPINGS = {
  // ✅ 1. Serial Number / ID
  srNo: ['SR. No.', 'SR NO', 'SR.No.', 'S.No', 'Serial No', 'Sr No', 'Sr.No.', 'S. No.'],
  
  // ✅ 2. Enquiry Number (Primary Key) - Column header: "Enq No."
  enquiryNumber: ['Enq No.', 'Enq No', 'ENQ NO', 'Enquiry No', 'Enquiry Number', 'EnqNo', 'Enq.No.', 'Enq. No.', 'ENQ. NO.', 'Enquiry No.', 'Enq No.'],
  
  // ✅ 3. Market Segment - Column header: "EXPORT / DOMESTIC"
  marketType: ['EXPORT / DOMESTIC', 'EXPORT/DOMESTIC', 'Export / Domestic', 'Export/Domestic', 'Market', 'Market Type', 'MARKET TYPE', 'Export Domestic', 'Market Segment'],
  
  // ✅ 4. PO Number - Column header: "PO No." (mostly "-" in dataset)
  poNumber: ['PO No.', 'PO No', 'PONo', 'PO NO', 'PO Number', 'Purchase Order', 'PO. No.', 'P.O. No.', 'PO. Number'],
  
  // ✅ 5. DATE RECEIVED (Enquiry Date) - Column header: "DATE RECEIVED"
  dateReceived: ['DATE RECEIVED', 'Date Received', 'Received Date', 'DateReceived', 'DATE RECEIVED', 'Date. Received', 'DATE. RECEIVED', 'Enquiry Date', 'Date'],
  
  // ✅ 6. DATE SUBMITTED (Quotation/Submission Date) - Column header: "DATE SUBMITTED"
  dateSubmitted: ['DATE SUBMITTED', 'Date Submitted', 'Submitted Date', 'DateSubmitted', 'Quotation Date', 'Quote Date', 'DATE SUBMITTED', 'Date. Submitted', 'DATE. SUBMITTED', 'Submission Date'],
  
  // ✅ 7. DRAWING Status - Column header: "DRAWING" (Y/N boolean)
  drawingRequired: ['DRAWING', 'Drawing', 'Drawing Status', 'Drawing Required', 'DrawingRequired', 'DRAWING', 'Drawing.'],
  
  // ✅ 8. COSTING Status - Column header: "COSTING" (Y/N boolean)
  costingCompleted: ['COSTING', 'Costing', 'Costing Status', 'Costing Completed', 'CostingCompleted', 'COSTING', 'Costing.'],
  
  // ✅ 9. R&D Representative - Column header: "R&D"
  rndHandler: ['R&D', 'R & D', 'RND', 'R&D Handler', 'RND Handler', 'R&D Person', 'Research', 'R&D.', 'R & D.', 'RnD', 'RND Handler'],
  
  // ✅ 10. SALES Representative - Column header: "SALES"
  salesRep: ['SALES', 'Sales', 'Sales Representative', 'Sales Rep', 'SALES REP', 'Representative', 'SALES.', 'Sales.', 'SALES REPRESENTATIVE', 'Sales Person'],
  
  // ✅ 11. Status - Column header: "OPEN / CLOSED"
  status: ['OPEN / CLOSED', 'OPEN/CLOSED', 'Open / Closed', 'Open/Closed', 'STATUS', 'Enquiry Status', 'Status', 'OPEN CLOSED'],
  
  // ✅ 12. ACTIVITY - Column header: "ACTIVITY"
  activity: ['ACTIVITY', 'Activity', 'Current Activity', 'ActivityStatus', 'ACTIVITY', 'Activity.', 'Activity Type'],
  
  // ✅ 13. SCOPE OF SUPPLY - Column header: "SCOPE OF SUPPLY"
  supplyScope: ['SCOPE OF SUPPLY', 'Scope Of Supply', 'Supply Scope', 'Scope', 'SUPPLY SCOPE', 'ScopeOfSupply', 'SCOPE. OF SUPPLY', 'Scope of Supply', 'Supply'],
  
  // ✅ 14. PRODUCT TYPE - Column header: "PRODUCT TYPE"
  productType: ['PRODUCT TYPE', 'Product Type', 'ProductType', 'Product', 'PRODUCT. TYPE', 'Product. Type', 'PRODUCT TYPE', 'Product Category'],
  
  // ✅ 15. DAYS TO COMPLETE ENQUIRY - Column header: "DAYS TO COMPLETE ENQUIRY"
  daysRequired: ['DAYS TO COMPLETE ENQUIRY', 'Days To Complete Enquiry', 'DAYS TO COMPLETE', 'Days To Complete', 'Days Required', 'Fulfillment Days', 'DaysToComplete', 'Days to Complete Enquiry', 'Days', 'DAYS. TO COMPLETE', 'Days required for fulfillment'],
  
  // ✅ 16. REMARK - Column header: "REMARK"
  remarks: ['REMARK', 'Remarks', 'REMARKS', 'Comments', 'Notes', 'Remarks', 'Remark', 'REMARK', 'Closure Reason', 'Inquiry Notes'],
};

// Standardization functions
export const standardizeBoolean = (value) => {
  if (!value) return false;
  const str = String(value).toUpperCase().trim();
  return str === 'Y' || str === 'YES' || str === 'TRUE' || str === '1';
};

export const standardizeMarketSegment = (value) => {
  if (!value) return 'Domestic';
  const str = String(value).toUpperCase().trim();
  if (str.includes('EXPORT')) return 'Export';
  if (str.includes('DOMESTIC')) return 'Domestic';
  return 'Domestic';
};

export const standardizeActivity = (value) => {
  if (!value) return 'In Progress';
  const str = String(value).toUpperCase().trim();
  if (str === 'QUOTED' || str.includes('QUOTE')) return 'Quoted';
  if (str === 'REGRETED' || str === 'REGRETTED' || str.includes('REGRET')) return 'Regretted';
  if (str === 'IN-HOUSE' || str === 'INHOUSE') return 'In Progress';
  if (str === 'ON HOLD' || str === 'HOLD') return 'On Hold';
  if (str === '-' || str === '') return 'In Progress';
  return 'In Progress';
};

export const standardizeStatus = (value, activity) => {
  if (!value) return activity === 'Quoted' || activity === 'Regretted' ? 'Closed' : 'Open';
  const str = String(value).toUpperCase().trim();
  if (str === 'CLOSED' || str === 'CLOSE') return 'Closed';
  if (str === 'OPEN') return 'Open';
  return activity === 'Quoted' || activity === 'Regretted' ? 'Closed' : 'Open';
};

export const standardizeSupplyScope = (value) => {
  if (!value || value === '-') return null;
  const str = String(value).toUpperCase().trim();
  
  if (str === 'IN-HOUSE' || str === 'INHOUSE' || str === 'IN HOUSE') return 'Inhouse';
  if (str === 'BO' || str === 'BROUGHTOUT' || str === 'BROUGHT OUT' || str === 'BROUGHT-OUT') return 'Broughtout';
  if (str.includes('IN-HOUSE') && str.includes('BO')) return 'Both';
  if (str.includes('IN HOUSE') && str.includes('BO')) return 'Both';
  if (str.includes('INHOUSE') && str.includes('BO')) return 'Both';
  if (str.includes('&')) return 'Both';
  if (str.includes('AND')) return 'Both';
  
  return null;
};

export const standardizeProductType = (value) => {
  if (!value || value === '-') return 'SP';
  const str = String(value).toUpperCase().trim();
  if (str === 'SP') return 'SP';
  if (str === 'NSP') return 'NSP';
  if (str.includes('SP') && str.includes('NSP')) return 'SP+NSP';
  if (str.includes('&')) return 'SP+NSP';
  return 'SP';
};

// Get value using predefined column mapping
export const getFieldValue = (row, fieldName) => {
  const possibleColumns = COLUMN_MAPPINGS[fieldName] || [];
  return findValueInRow(row, ...possibleColumns);
};
