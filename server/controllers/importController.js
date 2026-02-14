import XLSX from 'xlsx';
import fs from 'fs';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import CustomField from '../models/CustomField.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { 
  getFieldValue, 
  standardizeBoolean,
  standardizeMarketSegment,
  standardizeActivity,
  standardizeStatus,
  standardizeSupplyScope,
  standardizeProductType 
} from '../utils/columnMapper.js';

// Helper function to parse date from Excel
const parseExcelDate = (excelDate) => {
  if (!excelDate) return null;
  
  if (excelDate instanceof Date) return excelDate;
  
  // Handle Excel serial number dates
  if (typeof excelDate === 'number') {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return new Date(date.y, date.m - 1, date.d);
  }
  
  // Handle DD-MM-YYYY string format (e.g., "28-08-2025")
  if (typeof excelDate === 'string') {
    const str = excelDate.trim();
    
    // Check for DD-MM-YYYY format
    const ddmmyyyyMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try standard date parsing as fallback
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  return null;
};

// Helper function to clean and normalize strings
const cleanString = (str) => {
  if (!str) return '';
  return String(str).trim();
};

// Helper function to get or create user
const getOrCreateUser = async (name, role) => {
  if (!name || cleanString(name) === '') return null;
  
  const cleanName = cleanString(name);
  const email = `${cleanName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  
  let user = await User.findOne({ name: cleanName });
  
  if (!user) {
    user = await User.create({
      name: cleanName,
      email,
      password: 'password123',
      role: role || 'sales',
      department: role === 'r&d' ? 'R&D' : 'Sales',
    });
  }
  
  return user;
};

// @desc    Bulk import enquiries from uploaded Excel file
// @route   POST /api/enquiries/bulk-import
// @access  Private (Admin, Sales)
export const bulkImportEnquiries = async (req, res, next) => {
  let filePath = null;
  const isSuperuser = req.user?.role === 'superuser';
  
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload an Excel file');
    }

    filePath = req.file.path;
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Usually 'Task list'
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('Sheet name:', sheetName);
    console.log('Sheet range:', worksheet['!ref']);
    
    // Convert to JSON - read from row 2 (index 1) since row 1 has grouped headers
    // ✅ IMPORTANT: Using range: 1 means start from row 2 (0-indexed)
    let data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '',
      blankrows: false,
      range: 1  // ✅ Read from row 2, using it as header row
    });
    
    console.log('\n📋 Excel File Reading:');
    console.log(`Total data rows extracted: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`First row column keys: ${Object.keys(data[0]).join(', ')}`);
      console.log(`First row data (sample): ${JSON.stringify(data[0]).substring(0, 250)}`);
    }
    
    if (!data || data.length === 0) {
      throw new ApiError(400, 'Excel file is empty or has no data');
    }

    const results = {
      total: data.length,
      successful: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      columnNames: Object.keys(data[0] || {}), // For debugging
    };

    // ✅ Validate all 16 columns are present
    const { COLUMN_MAPPINGS } = await import('../utils/columnMapper.js');
    
    console.log('\n📋 ============= COLUMN VALIDATION =============');
    console.log('Expected 16 Excel columns:');
    console.log('  1. SR. No. | 2. Enq No. | 3. EXPORT / DOMESTIC | 4. PO No.');
    console.log('  5. DATE RECEIVED | 6. DATE SUBMITTED | 7. DRAWING | 8. COSTING');
    console.log('  9. R&D | 10. SALES | 11. OPEN / CLOSED |12. ACTIVITY');
    console.log('  13. SCOPE OF SUPPLY | 14. PRODUCT TYPE | 15. DAYS TO COMPLETE ENQUIRY | 16. REMARK');
    
    console.log('\nActual columns in Excel file:');
    results.columnNames.forEach((col, idx) => {
      console.log(`  ${idx + 1}. "${col}"`);
    });
    
    // Validate column mapping
    console.log('\n✅ Column Mapping Check:');
    const allMappedColumns = new Set();
    Object.entries(COLUMN_MAPPINGS).forEach(([fieldName, possibleNames]) => {
      possibleNames.forEach(name => allMappedColumns.add(name));
    });
    
    results.columnNames.forEach(col => {
      const isMapped = Array.from(allMappedColumns).some(mappedCol => 
        mappedCol.toLowerCase() === col.toLowerCase()
      );
      console.log(`  ${isMapped ? '✅' : '⚠️'} "${col}"`);
    });
    console.log('=============================================\n');
    console.log('Expected Excel columns (16 total):');
    console.log('  1. SR. No.');
    console.log('  2. Enq No.');
    console.log('  3. EXPORT / DOMESTIC');
    console.log('  4. PO No.');
    console.log('  5. DATE RECEIVED');
    console.log('  6. DATE SUBMITTED');
    console.log('  7. DRAWING');
    console.log('  8. COSTING');
    console.log('  9. R&D');
    console.log('  10. SALES');
    console.log('  11. OPEN / CLOSED');
    console.log('  12. ACTIVITY');
    console.log('  13. SCOPE OF SUPPLY');
    console.log('  14. PRODUCT TYPE');
    console.log('  15. DAYS TO COMPLETE ENQUIRY');
    console.log('  16. REMARK');
    
    console.log('\nActual columns detected in Excel:');
    results.columnNames.forEach((col, idx) => {
      console.log(`  ${idx + 1}. "${col}"`);
    });
    
    // Log actual column names for debugging
    console.log('Excel columns detected:', results.columnNames);
    console.log('First row sample (all fields):', JSON.stringify(data[0], null, 2));
    
    // Check for enquiry number in first row with all possible keys
    if (data[0]) {
      console.log('Checking enquiry number field in first row:');
      Object.keys(data[0]).forEach(key => {
        if (key.toLowerCase().includes('enq') || key.toLowerCase().includes('no')) {
          console.log(`  "${key}": "${data[0][key]}"`);
        }
      });
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let enquiryNumber = 'Unknown'; // Initialize outside try block for catch block access
      
      try {
        // ✅ IMPORTANT: Extract core data - use EXACT column matching from Excel
        // The Excel column is exactly "Enq No." so we must match it precisely
        const rawEnquiryNumber = row['Enq No.'] || row['Enq No'] || row['ENQ NO'];
        enquiryNumber = cleanString(rawEnquiryNumber);
        const poNumber = cleanString(getFieldValue(row, 'poNumber'));
        
        // Debug logging for first 10 rows
        if (i < 10) {
          console.log(`\n=== Row ${i + 1} - Data Extraction ===`);
          console.log(`Excel columns available:`, Object.keys(row));
          console.log(`Enq No. extracted: "${enquiryNumber}" (raw: "${rawEnquiryNumber}")`);
        }
        
        // Skip if no enquiry number (empty row)
        if (!enquiryNumber) {
          if (i < 10) console.log(`⚠️ Row ${i + 1}: Skipped (no enquiry number)`);
          continue;
        }
        
        // Market Segment (EXPORT / DOMESTIC)
        const marketType = standardizeMarketSegment(getFieldValue(row, 'marketType'));
        
        // ✅ DATES: Must extract directly from Excel and parse correctly
        const rawDateReceived = row['DATE RECEIVED'] || row['Date Received'];
        const rawDateSubmitted = row['DATE SUBMITTED'] || row['Date Submitted'];
        
        const dateReceived = parseExcelDate(rawDateReceived);
        const dateSubmitted = parseExcelDate(rawDateSubmitted);
        const enquiryDate = dateReceived || new Date();
        
        // Debug dates for first 10 rows
        if (i < 10) {
          console.log(`Dates: Recv="${rawDateReceived}"→${dateReceived} | Subm="${rawDateSubmitted}"→${dateSubmitted}`);
        }
        
        // Requirements (Y/N boolean fields)
        const drawingRequired = standardizeBoolean(getFieldValue(row, 'drawingRequired'));
        const costingCompleted = standardizeBoolean(getFieldValue(row, 'costingCompleted'));
        
        // Team Assignment
        const rndName = cleanString(getFieldValue(row, 'rndHandler'));
        const salesName = cleanString(getFieldValue(row, 'salesRep'));
        
        // Get or create users
        const rndHandler = rndName ? await getOrCreateUser(rndName, 'r&d') : null;
        const salesRep = salesName ? await getOrCreateUser(salesName, 'sales') : await getOrCreateUser('Default Sales Rep', 'sales');
        
        // Status fields
        const activityRaw = getFieldValue(row, 'activity');
        const activity = standardizeActivity(activityRaw);
        const statusRaw = getFieldValue(row, 'status');
        const status = standardizeStatus(statusRaw, activity);
        
        // Scope and Product
        const supplyScope = standardizeSupplyScope(getFieldValue(row, 'supplyScope'));
        const productType = standardizeProductType(getFieldValue(row, 'productType'));
        
        // Performance
        const daysValue = getFieldValue(row, 'daysRequired');
        const daysRequiredForFulfillment = daysValue ? parseInt(daysValue) : 0;
        
        // Remarks
        const remarks = cleanString(getFieldValue(row, 'remarks')) || 'No remarks';
        
        // ✅ Create enquiry data object - INCLUDE ALL FIELDS WITH ACTUAL EXCEL VALUES
        const enquiryData = {
          enquiryNumber,  // Use actual Excel enquiry number (not auto-generated)
          customerName: `Customer-${enquiryNumber}`,
          enquiryDate,
          dateReceived,    // ✅ IMPORTANT: Include dateReceived
          dateSubmitted,   // ✅ IMPORTANT: Include dateSubmitted
          quoteDate: dateSubmitted,
          marketType,
          productType,
          supplyScope: supplyScope || 'Not specified',
          activity,
          status,
          remarks,
          createdBy: req.user.id,
        };
        
        // Debug for first 5 rows
        if (i < 5) {
          console.log(`📝 Enquiry#${enquiryNumber}: dates=${dateReceived ? 'YES' : 'NO'}, market=${marketType}, activity=${activity}`);
        }
        
        // Add optional fields
        if (poNumber && poNumber !== '-') enquiryData.poNumber = poNumber;
        if (dateReceived && dateReceived instanceof Date && !isNaN(dateReceived.getTime())) {
          enquiryData.dateReceived = dateReceived;
        }
        if (dateSubmitted && dateSubmitted instanceof Date && !isNaN(dateSubmitted.getTime())) {
          enquiryData.dateSubmitted = dateSubmitted;
          enquiryData.quoteDate = dateSubmitted; // Submitted date = quote date
        }
        
        // Department statuses based on Y/N fields
        enquiryData.drawingStatus = drawingRequired ? 'Completed' : 'Not Required';
        enquiryData.costingStatus = costingCompleted ? 'Completed' : 'Not Required';
        
        // R&D and Sales status
        if (rndHandler) {
          enquiryData.rndStatus = 'Completed';
          enquiryData.rndHandler = rndHandler._id;
          enquiryData.rndHandlerName = rndHandler.name;
        } else {
          enquiryData.rndStatus = 'Not Required';
        }
        
        if (salesRep) {
          enquiryData.salesStatus = 'Completed';
          enquiryData.salesRepresentative = salesRep._id;
          enquiryData.salesRepName = salesRep.name;
        }
        
        // Manufacturing type from supply scope
        if (supplyScope) {
          enquiryData.manufacturingType = supplyScope;
        }
        
        // Days for fulfillment
        if (daysRequiredForFulfillment >= 0) {
          enquiryData.daysRequiredForFulfillment = daysRequiredForFulfillment;
        }
        
        // Closure date for closed enquiries
        if (status === 'Closed' && dateSubmitted) {
          enquiryData.closureDate = dateSubmitted;
        }

        // DYNAMIC FIELDS HANDLING
        // ✅ IMPORTANT: Capture ALL columns from Excel
        // Strategy: Map known columns to schema fields, store unknown columns in dynamicFields
        
        const dynamicFields = {};
        
        // All Excel column keys (normalized)
        const excelColumnKeys = Object.keys(row);
        
        // Known Excel columns that map to static schema fields
        const mappedColumns = [
          ...Object.values(COLUMN_MAPPINGS).flat(),
          // Also include already-processed fields
          'sr_no', 'enquiry_number', 'market_segment', 'po_number', 'date_received',
          'date_submitted', 'drawing', 'costing', 'rnd_handler', 'sales_rep',
          'status_field', 'activity_field', 'supply_scope', 'product_type_field',
          'days_required', 'remarks_field'
        ];

        // Process ALL row columns
        for (const [key, value] of Object.entries(row)) {
          // Skip empty columns
          if (!value || cleanString(value) === '') {
            continue;
          }

          const cleanKey = cleanString(key);
          
          // Check if this column was already processed as a static field
          const isProcessedField = Object.values(COLUMN_MAPPINGS).flat()
            .some(colName => colName.toLowerCase() === key.toLowerCase() ||
                            colName.toLowerCase() === cleanKey);
          
          // If NOT a processed static field, treat as dynamic field
          if (!isProcessedField) {
            try {
              // Normalize the column name for field names
              const fieldName = key
                .toLowerCase()
                .replace(/\s+/g, '_')        // spaces → underscore
                .replace(/[&/]+/g, 'and')    // & / → and
                .replace(/[^a-z0-9_]/g, '')  // remove special chars
                .replace(/_+/g, '_')         // collapse multiple underscores
                .slice(0, 50);               // max 50 chars
              
              if (!fieldName) {
                // Skip if field name becomes empty after normalization
                if (i < 3) console.log(`Skipping column with invalid name: "${key}"`);
                continue;
              }

              let customField = await CustomField.findOne({ name: fieldName });
              
              if (!customField) {
                // If superuser, auto-create the field
                if (isSuperuser) {
                  try {
                    customField = await CustomField.create({
                      name: fieldName,
                      label: key,  // Keep original Excel column name as display label
                      type: 'text',
                      createdBy: req.user.id,
                    });
                    if (i < 5) console.log(`✅ Auto-created custom field: "${key}" → field name: "${fieldName}"`);
                  } catch (createError) {
                    if (i < 5) console.log(`⚠️ Could not auto-create field "${fieldName}": ${createError.message}`);
                    // Still store in dynamic fields, might be a duplicate
                    dynamicFields[fieldName] = value;
                    continue;
                  }
                } else {
                  // For non-superuser, still capture in dynamicFields so data isn't lost
                  if (i < 5) console.log(`📝 Capturing unknown field for non-superuser: "${key}" → "${fieldName}"`);
                  dynamicFields[fieldName] = value;
                  continue;
                }
              }

              // ✅ Store dynamic field value
              dynamicFields[customField.name] = value;
              
            } catch (fieldError) {
              console.log(`⚠️ Error processing dynamic field "${key}":`, fieldError.message);
              // Still try to capture it
              const fallbackName = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 50);
              if (fallbackName) {
                dynamicFields[fallbackName] = value;
              }
            }
          }
        }

        // ✅ Add dynamic fields to enquiry data (always add, even if empty)
        if (Object.keys(dynamicFields).length > 0) {
          enquiryData.dynamicFields = dynamicFields;
          if (i < 3) console.log(`Row ${i + 1} dynamic fields:`, Object.keys(dynamicFields));
        }
        
        // Check if enquiry already exists and update instead of creating
        const existingEnquiry = enquiryNumber
          ? await Enquiry.findOne({ enquiryNumber })
          : null;
        
        if (i < 10) {
          console.log(`\n✅ Ready to save Enquiry #${enquiryNumber}:`);
          console.log(`   enquiryNumber: "${enquiryData.enquiryNumber}" (will use this, NOT auto-generate)`);
          console.log(`   dateReceived: ${enquiryData.dateReceived}`);
          console.log(`   dateSubmitted: ${enquiryData.dateSubmitted}`);
          console.log(`   drawingStatus: ${enquiryData.drawingStatus}`);
          console.log(`   costingStatus: ${enquiryData.costingStatus}`);
          console.log(`   marketType: ${enquiryData.marketType}`);
          console.log(`   activity: ${enquiryData.activity}`);
          console.log(`   Existing? ${existingEnquiry ? 'YES (will update)' : 'NO (will create)'}`);
        }
        
        if (existingEnquiry) {
          await Enquiry.findByIdAndUpdate(existingEnquiry._id, enquiryData);
          if (i < 10) console.log(`   ✅ Updated existing enquiry`);
          results.updated++;
        } else {
          await Enquiry.create(enquiryData);
          if (i < 10) console.log(`   ✅ Created new enquiry`);
          results.created++;
        }
        results.successful++;
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          enquiryNumber: enquiryNumber || row['SR. No.'] || 'Unknown'
        });
      }
    }

    // ✅ FINAL IMPORT SUMMARY - Show which columns were processed
    console.log('\n📊 ============= IMPORT SUMMARY =============');
    console.log(`Total rows processed: ${results.successful}`);
    console.log(`Successfully imported: ${results.created}`);
    console.log(`Updated: ${results.updated}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      results.errors.slice(0, 10).forEach(err => {
        console.log(`  Row ${err.row}: ${err.error}`);
      });
      if (results.errors.length > 10) {
        console.log(`  ... and ${results.errors.length - 10} more errors`);
      }
    }
    
    console.log('\n✅ Expected 16 Columns Capture Status:');
    const expectedColumns = [
      'SR. No.', 'Enq No.', 'EXPORT / DOMESTIC', 'PO No.',
      'DATE RECEIVED', 'DATE SUBMITTED', 'DRAWING', 'COSTING',
      'R&D', 'SALES', 'OPEN / CLOSED', 'ACTIVITY',
      'SCOPE OF SUPPLY', 'PRODUCT TYPE', 'DAYS TO COMPLETE ENQUIRY', 'REMARK'
    ];
    
    expectedColumns.forEach((col, idx) => {
      const found = results.columnNames.includes(col);
      console.log(`  ${idx + 1}. ${found ? '✅' : '❌'} "${col}"`);
    });
    console.log('==========================================\n');

    // Delete the uploaded file after processing
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: 'Import completed',
      data: results,
    });
    
  } catch (error) {
    // Delete the uploaded file if there's an error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(error);
  }
};
