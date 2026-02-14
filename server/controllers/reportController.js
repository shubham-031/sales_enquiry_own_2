import Enquiry from '../models/Enquiry.js';
import CustomField from '../models/CustomField.js';
import ExcelJS from 'exceljs';

// @desc    Generate custom report
// @route   POST /api/reports/generate
// @access  Private (Admin, Management)
export const generateReport = async (req, res, next) => {
  try {
    const { startDate, endDate, marketType, productType, status } = req.body;

    const filter = {};
    if (startDate || endDate) {
      filter.enquiryDate = {};
      if (startDate) filter.enquiryDate.$gte = new Date(startDate);
      if (endDate) filter.enquiryDate.$lte = new Date(endDate);
    }
    if (marketType) filter.marketType = marketType;
    if (productType) filter.productType = productType;
    if (status) filter.status = status;

    const enquiries = await Enquiry.find(filter)
      .populate('salesRepresentative', 'name')
      .populate('rndHandler', 'name')
      .sort({ enquiryDate: -1 });

    const summary = {
      totalEnquiries: enquiries.length,
      quoted: enquiries.filter(e => e.activity === 'Quoted').length,
      regretted: enquiries.filter(e => e.activity === 'Regretted').length,
      inProgress: enquiries.filter(e => e.activity === 'In Progress').length,
      onHold: enquiries.filter(e => e.activity === 'On Hold').length,
      avgFulfillmentTime: enquiries.reduce((sum, e) => sum + (e.fulfillmentTime || 0), 0) / enquiries.length || 0,
      domestic: enquiries.filter(e => e.marketType === 'Domestic').length,
      export: enquiries.filter(e => e.marketType === 'Export').length,
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        enquiries,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export data to Excel
// @route   POST /api/reports/export/excel
// @access  Private
export const exportToExcel = async (req, res, next) => {
  try {
    const { startDate, endDate, marketType, productType, status, activity } = req.body;

    const filter = {};
    if (startDate || endDate) {
      filter.enquiryDate = {};
      if (startDate) filter.enquiryDate.$gte = new Date(startDate);
      if (endDate) filter.enquiryDate.$lte = new Date(endDate);
    }
    if (marketType) filter.marketType = marketType;
    if (productType) filter.productType = productType;
    if (status) filter.status = status;
    if (activity) filter.activity = activity;

    const enquiries = await Enquiry.find(filter)
      .populate('salesRepresentative', 'name')
      .populate('rndHandler', 'name')
      .sort({ enquiryDate: -1 });

    // Fetch all active custom fields
    const customFields = await CustomField.find({ isActive: true }).sort({ createdAt: 1 });

    // ✅ IMPORTANT: Also collect all unique dynamic field names from enquiries
    // This captures orphaned fields that were imported but don't have CustomField entries
    const allDynamicFieldNames = new Set();
    customFields.forEach(field => allDynamicFieldNames.add(field.name));
    
    enquiries.forEach(enquiry => {
      if (enquiry.dynamicFields && typeof enquiry.dynamicFields === 'object') {
        Object.keys(enquiry.dynamicFields).forEach(fieldName => {
          allDynamicFieldNames.add(fieldName);
        });
      }
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Enquiries Report');

    // Define static columns
    const staticColumns = [
      { header: 'Enquiry Number', key: 'enquiryNumber', width: 20 },
      { header: 'Enquiry Date', key: 'enquiryDate', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 30 },
      { header: 'Market Type', key: 'marketType', width: 15 },
      { header: 'Product Type', key: 'productType', width: 15 },
      { header: 'Supply Scope', key: 'supplyScope', width: 30 },
      { header: 'Sales Representative', key: 'salesRep', width: 20 },
      { header: 'R&D Handler', key: 'rndHandler', width: 20 },
      { header: 'Activity', key: 'activity', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Quote Date', key: 'quoteDate', width: 15 },
      { header: 'Closure Date', key: 'closureDate', width: 15 },
      { header: 'Fulfillment Time (days)', key: 'fulfillmentTime', width: 20 },
      { header: 'Remarks', key: 'remarks', width: 40 },
    ];

    // Add dynamic field columns (both defined CustomFields and orphaned fields)
    const dynamicColumns = Array.from(allDynamicFieldNames)
      .sort()
      .map(fieldName => {
        // Try to find CustomField for label, fallback to field name
        const customField = customFields.find(f => f.name === fieldName);
        const label = customField?.label || fieldName
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          header: label,
          key: `dynamic_${fieldName}`,
          width: 20
        };
      });

    // Combine all columns
    worksheet.columns = [...staticColumns, ...dynamicColumns];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    enquiries.forEach((enquiry) => {
      const rowData = {
        enquiryNumber: enquiry.enquiryNumber,
        enquiryDate: enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toLocaleDateString() : '',
        customerName: enquiry.customerName,
        marketType: enquiry.marketType,
        productType: enquiry.productType,
        supplyScope: enquiry.supplyScope || '',
        salesRep: enquiry.salesRepresentative?.name || '',
        rndHandler: enquiry.rndHandler?.name || '',
        activity: enquiry.activity,
        status: enquiry.status,
        quoteDate: enquiry.quotationDate ? new Date(enquiry.quotationDate).toLocaleDateString() : '',
        closureDate: enquiry.closureDate ? new Date(enquiry.closureDate).toLocaleDateString() : '',
        fulfillmentTime: enquiry.fulfillmentTime || '',
        remarks: enquiry.remarks || '',
      };

      // Add dynamic field values (both defined and orphaned fields)
      Array.from(allDynamicFieldNames).forEach(fieldName => {
        const value = enquiry.dynamicFields?.get?.(fieldName) || enquiry.dynamicFields?.[fieldName] || '';
        rowData[`dynamic_${fieldName}`] = value;
      });

      worksheet.addRow(rowData);
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Sales_Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export data to CSV
// @route   POST /api/reports/export/csv
// @access  Private
export const exportToCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, marketType, productType, status, activity } = req.body;

    const filter = {};
    if (startDate || endDate) {
      filter.enquiryDate = {};
      if (startDate) filter.enquiryDate.$gte = new Date(startDate);
      if (endDate) filter.enquiryDate.$lte = new Date(endDate);
    }
    if (marketType) filter.marketType = marketType;
    if (productType) filter.productType = productType;
    if (status) filter.status = status;
    if (activity) filter.activity = activity;

    const enquiries = await Enquiry.find(filter)
      .populate('salesRepresentative', 'name')
      .populate('rndHandler', 'name')
      .sort({ enquiryDate: -1 });

    // ✅ Collect all unique dynamic field names from enquiries (for CSV export)
    const allDynamicFieldNames = new Set();
    enquiries.forEach(enquiry => {
      if (enquiry.dynamicFields && typeof enquiry.dynamicFields === 'object') {
        Object.keys(enquiry.dynamicFields).forEach(fieldName => {
          allDynamicFieldNames.add(fieldName);
        });
      }
    });

    // Create CSV content
    const headers = [
      'Enquiry Number',
      'Enquiry Date',
      'Customer Name',
      'Market Type',
      'Product Type',
      'Supply Scope',
      'Sales Representative',
      'R&D Handler',
      'Activity',
      'Status',
      'Quote Date',
      'Closure Date',
      'Fulfillment Time',
      'Remarks',
      'Delay Remarks',
      // ✅ Add dynamic field headers
      ...Array.from(allDynamicFieldNames).sort()
    ];

    let csvContent = headers.join(',') + '\n';

    enquiries.forEach((enquiry) => {
      const row = [
        enquiry.enquiryNumber,
        enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toLocaleDateString() : '',
        `"${enquiry.customerName}"`,
        enquiry.marketType,
        enquiry.productType,
        `"${enquiry.supplyScope || ''}"`,
        `"${enquiry.salesRepresentative?.name || ''}"`,
        `"${enquiry.rndHandler?.name || ''}"`,
        enquiry.activity,
        enquiry.status,
        enquiry.quoteDate ? new Date(enquiry.quoteDate).toLocaleDateString() : '',
        enquiry.closureDate ? new Date(enquiry.closureDate).toLocaleDateString() : '',
        enquiry.fulfillmentTime || '',
        `"${enquiry.remarks || ''}"`,
        `"${enquiry.delayRemarks || ''}"`,
        // ✅ Add dynamic field values
        ...Array.from(allDynamicFieldNames)
          .sort()
          .map(fieldName => {
            const value = enquiry.dynamicFields?.[fieldName] || '';
            // Quote if it contains comma or newline
            return typeof value === 'string' && (value.includes(',') || value.includes('\n'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
      ];
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Sales_Enquiries_${new Date().toISOString().split('T')[0]}.csv`
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
