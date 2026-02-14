import SystemField from '../models/SystemField.js';
import Enquiry from '../models/Enquiry.js';
import { ApiError } from '../middlewares/errorHandler.js';

const DEFAULT_SYSTEM_FIELDS = [
  { name: 'enquiryNumber', label: 'Enquiry #', type: 'text' },
  { name: 'customerName', label: 'Customer', type: 'text' },
  { name: 'poNumber', label: 'PO Number', type: 'text' },
  { name: 'enquiryDate', label: 'Enquiry Date', type: 'date' },
  { name: 'dateReceived', label: 'Date Received', type: 'date' },
  { name: 'dateSubmitted', label: 'Date Submitted', type: 'date' },
  { name: 'marketType', label: 'Market', type: 'text' },
  { name: 'productType', label: 'Product', type: 'text' },
  { name: 'supplyScope', label: 'Supply Scope', type: 'text' },
  { name: 'quantity', label: 'Quantity', type: 'number' },
  { name: 'estimatedValue', label: 'Estimated Value', type: 'number' },
  { name: 'manufacturingType', label: 'Manufacturing', type: 'text' },
  { name: 'drawingStatus', label: 'Drawing', type: 'text' },
  { name: 'costingStatus', label: 'Costing', type: 'text' },
  { name: 'rndStatus', label: 'R&D', type: 'text' },
  { name: 'salesStatus', label: 'Sales', type: 'text' },
  { name: 'activity', label: 'Activity', type: 'text' },
  { name: 'status', label: 'Status', type: 'text' },
  { name: 'salesRepresentative', label: 'Sales Rep', type: 'text' },
  { name: 'rndHandler', label: 'R&D Handler', type: 'text' },
  { name: 'daysRequiredForFulfillment', label: 'Days Required', type: 'number' },
  { name: 'quotationDate', label: 'Quotation Date', type: 'date' },
  { name: 'closureDate', label: 'Closure Date', type: 'date' },
  { name: 'remarks', label: 'Remarks', type: 'text' },
];

const ensureSystemFields = async () => {
  const upserts = DEFAULT_SYSTEM_FIELDS.map(field =>
    SystemField.findOneAndUpdate(
      { name: field.name },
      { $setOnInsert: field },
      { upsert: true, new: true }
    )
  );

  await Promise.all(upserts);
};

const getDefaultField = (name) => DEFAULT_SYSTEM_FIELDS.find(field => field.name === name);

// @desc    Get all system fields
// @route   GET /api/system-fields
// @access  Private
export const getSystemFields = async (req, res, next) => {
  try {
    await ensureSystemFields();
    const systemFields = await SystemField.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: systemFields,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a system field label
// @route   PUT /api/system-fields/:name
// @access  Private (Superuser only)
export const updateSystemField = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { label } = req.body;

    const defaultField = getDefaultField(name);
    if (!defaultField) {
      throw new ApiError(404, 'System field not found');
    }

    if (!label) {
      throw new ApiError(400, 'Label is required');
    }

    const updated = await SystemField.findOneAndUpdate(
      { name },
      { label, updatedBy: req.user.id },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'System field updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (deactivate) a system field
// @route   DELETE /api/system-fields/:name
// @access  Private (Superuser only)
export const deleteSystemField = async (req, res, next) => {
  try {
    const { name } = req.params;
    const forceDelete = String(req.query.force).toLowerCase() === 'true';

    const defaultField = getDefaultField(name);
    if (!defaultField) {
      throw new ApiError(404, 'System field not found');
    }

    const affectedCount = await Enquiry.countDocuments({ [name]: { $exists: true, $ne: null } });

    if (affectedCount > 0 && !forceDelete) {
      return res.status(409).json({
        success: false,
        message: `Field is used in ${affectedCount} enquiries. Pass force=true to delete and remove data.`,
        requiresForce: true,
        affectedCount,
      });
    }

    if (affectedCount > 0 && forceDelete) {
      await Enquiry.updateMany(
        { [name]: { $exists: true } },
        { $unset: { [name]: '' } }
      );
    }

    const updated = await SystemField.findOneAndUpdate(
      { name },
      { isActive: false, updatedBy: req.user.id },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'System field deleted successfully',
      affectedCount,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
