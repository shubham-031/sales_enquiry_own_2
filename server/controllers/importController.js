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
    
    // Convert to JSON - first check if we need to skip header rows
    let data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '',
      blankrows: false
    });
    
    // Check if first row contains header names (merged cells create __EMPTY columns)
    if (data.length > 0 && data[0]['__EMPTY'] === 'Enq No.') {
      console.log('Detected header row in data, using row 2 as actual header');
      // First row is actually the header, re-read with proper header
      data = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        defval: '',
        blankrows: false,
        range: 1 // Start from row 2 (0-indexed, so 1 means row 2)
      });
      
      // Manually map the columns based on position since headers are in merged cells
      const properHeaders = [
        'SR. No.', 'Enq No.', 'EXPORT / DOMESTIC', 'PO No.',
        'DATE RECEIVED', 'DATE SUBMITTED', 'DRAWING', 'COSTING',
        'R&D', 'SALES', 'OPEN / CLOSED', 'ACTIVITY',
        'SCOPE OF SUPPLY', 'PRODUCT TYPE', 'DAYS TO COMPLETE ENQUIRY', 'REMARK'
      ];
      
      // Remap data with proper headers
      data = data.map(row => {
        const newRow = {};
        const keys = Object.keys(row);
        keys.forEach((key, index) => {
          if (properHeaders[index]) {
            newRow[properHeaders[index]] = row[key];
          }
        });
        return newRow;
      });
    }
    
    console.log('Total rows extracted:', data.length);
    
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
      
      try {
        // Extract core data using flexible column mapping
        const enquiryNumber = cleanString(getFieldValue(row, 'enquiryNumber'));
        const poNumber = cleanString(getFieldValue(row, 'poNumber'));
        
        // Debug logging for first 3 rows
        if (i < 3) {
          console.log(`\n=== Row ${i + 1} Debug ===`);
          console.log(`Enquiry Number extracted: "${enquiryNumber}"`);
          console.log(`All row keys:`, Object.keys(row));
        }
        
        // Skip if no enquiry number (empty row) unless superuser override is allowed
        if (!enquiryNumber && !isSuperuser) {
          if (i < 5) console.log(`Skipping row ${i + 1}: No enquiry number found`);
          continue;
        }
        
        // Market Segment (EXPORT / DOMESTIC)
        const marketType = standardizeMarketSegment(getFieldValue(row, 'marketType'));
        
        // Dates
        const dateReceived = parseExcelDate(getFieldValue(row, 'dateReceived'));
        const dateSubmitted = parseExcelDate(getFieldValue(row, 'dateSubmitted'));
        const enquiryDate = dateReceived || new Date();
        
        // Debug first few rows
        if (i < 3) {
          console.log(`Row ${i + 1} dates:`, {
            rawReceived: getFieldValue(row, 'dateReceived'),
            rawSubmitted: getFieldValue(row, 'dateSubmitted'),
            parsedReceived: dateReceived,
            parsedSubmitted: dateSubmitted
          });
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
        
        // Create enquiry data object
        const enquiryData = {
          enquiryNumber,
          customerName: `Customer-${enquiryNumber}`, // Excel doesn't have customer names
          enquiryDate,
          marketType,
          productType,
          supplyScope: supplyScope || 'Not specified',
          activity,
          status,
          remarks,
          createdBy: req.user.id,
        };
        
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
        // Get all known static field keys
        const staticFieldKeys = [
          'SR. No.', 'Enq No.', 'EXPORT / DOMESTIC', 'PO No.',
          'DATE RECEIVED', 'DATE SUBMITTED', 'DRAWING', 'COSTING',
          'R&D', 'SALES', 'OPEN / CLOSED', 'ACTIVITY',
          'SCOPE OF SUPPLY', 'PRODUCT TYPE', 'DAYS TO COMPLETE ENQUIRY', 'REMARK',
          'enquiryNumber', 'poNumber', 'marketType', 'productType',
          'dateReceived', 'dateSubmitted', 'supplyScope', 'status', 'activity',
          'remarks', 'quantity', 'estimatedValue', 'drawingStatus',
          'costingStatus', 'rndStatus', 'salesStatus', 'manufacturingType'
        ];

        const dynamicFields = {};

        // Process all row keys to find dynamic fields
        for (const [key, value] of Object.entries(row)) {
          if (value && cleanString(value) !== '' && !staticFieldKeys.some(sf => sf.toLowerCase() === key.toLowerCase())) {
            // This is a potential dynamic field
            try {
              let customField = await CustomField.findOne({ label: key });
              
              if (!customField) {
                // If superuser, auto-create the field
                if (isSuperuser) {
                  const fieldName = key.toLowerCase().replace(/\s+/g, '_');
                  customField = await CustomField.create({
                    name: fieldName,
                    label: key,
                    type: 'text',
                    createdBy: req.user.id,
                  });
                } else {
                  // Skip unknown fields for non-superuser
                  if (i < 3) console.log(`Skipping unknown field for non-superuser: "${key}"`);
                  continue;
                }
              }

              // Store dynamic field value
              dynamicFields[customField.name] = value;
            } catch (fieldError) {
              console.log(`Error processing dynamic field "${key}":`, fieldError.message);
            }
          }
        }

        // Add dynamic fields to enquiry data
        if (Object.keys(dynamicFields).length > 0) {
          enquiryData.dynamicFields = dynamicFields;
        }
        
        // Check if enquiry already exists and update instead of creating
        const existingEnquiry = enquiryNumber
          ? await Enquiry.findOne({ enquiryNumber })
          : null;
        if (existingEnquiry) {
          await Enquiry.findByIdAndUpdate(existingEnquiry._id, enquiryData);
          console.log(`Updated existing enquiry: ${enquiryNumber}`);
          results.updated++;
        } else {
          await Enquiry.create(enquiryData);
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
