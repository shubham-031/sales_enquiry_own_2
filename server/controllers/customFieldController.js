import CustomField from '../models/CustomField.js';
import Enquiry from '../models/Enquiry.js';
import { ApiError } from '../middlewares/errorHandler.js';

const isNumberLike = (value) => {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return false;
    return Number.isFinite(Number(trimmed));
  }
  return false;
};

const isBooleanLike = (value) => {
  if (typeof value === 'boolean') return true;
  const str = String(value).toLowerCase().trim();
  return ['true', 'false', 'yes', 'no', 'y', 'n', '1', '0'].includes(str);
};

const isDateLike = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const isSelectLike = (value, options) => {
  if (!Array.isArray(options) || options.length === 0) return false;
  const normalized = String(value).trim();
  return options.some(option => String(option).trim() === normalized);
};

const isValueCompatible = (value, type, options) => {
  if (value === null || value === undefined) return true;
  if (type === 'text') return true;
  if (type === 'number') return isNumberLike(value);
  if (type === 'boolean') return isBooleanLike(value);
  if (type === 'date') return isDateLike(value);
  if (type === 'select') return isSelectLike(value, options);
  return false;
};

const validateTypeChangeSafety = async (fieldName, type, options) => {
  if (type === 'select' && (!Array.isArray(options) || options.length === 0)) {
    return {
      isSafe: false,
      reason: 'Select type requires non-empty options',
      affectedCount: 0,
    };
  }

  const query = { [`dynamicFields.${fieldName}`]: { $exists: true, $ne: null } };
  const cursor = Enquiry.find(query)
    .select(`dynamicFields.${fieldName}`)
    .cursor();

  let affectedCount = 0;
  for await (const doc of cursor) {
    const mapValue = doc.dynamicFields?.get?.(fieldName);
    const value = mapValue !== undefined ? mapValue : doc.dynamicFields?.[fieldName];

    if (value === '' || value === null || value === undefined) {
      continue;
    }

    affectedCount += 1;
    if (!isValueCompatible(value, type, options)) {
      return {
        isSafe: false,
        reason: 'Existing data is not compatible with the requested type',
        affectedCount,
      };
    }
  }

  return { isSafe: true, affectedCount };
};

// @desc    Get all custom fields
// @route   GET /api/custom-fields
// @access  Private
export const getCustomFields = async (req, res, next) => {
  try {
    const customFields = await CustomField.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: customFields,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new custom field
// @route   POST /api/custom-fields
// @access  Private (Superuser only)
export const createCustomField = async (req, res, next) => {
  try {
    const { name, label, type, options, isRequired, description } = req.body;

    // Validate required fields
    if (!name || !label) {
      throw new ApiError(400, 'Name and label are required');
    }

    // Check if name already exists
    const existingField = await CustomField.findOne({ name });
    if (existingField) {
      throw new ApiError(400, `Custom field with name '${name}' already exists`);
    }

    // Create custom field
    const customField = await CustomField.create({
      name,
      label,
      type: type || 'text',
      options: options || [],
      isRequired: isRequired || false,
      description,
      createdBy: req.user.id,
    });

    const populatedField = await customField.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Custom field created successfully',
      data: populatedField,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a custom field
// @route   PUT /api/custom-fields/:id
// @access  Private (Superuser only)
export const updateCustomField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, label, type, options, isRequired, description, isActive } = req.body;

    const customField = await CustomField.findById(id);
    if (!customField) {
      throw new ApiError(404, 'Custom field not found');
    }

    if (name && name !== customField.name) {
      throw new ApiError(400, 'Field name cannot be changed');
    }

    // Update only editable fields (name should not be changed)
    if (label) customField.label = label;

    if (type && type !== customField.type) {
      const safety = await validateTypeChangeSafety(customField.name, type, options || customField.options);
      if (!safety.isSafe) {
        throw new ApiError(400, safety.reason);
      }
      customField.type = type;
    }

    if (options) customField.options = options;
    if (isRequired !== undefined) customField.isRequired = isRequired;
    if (description !== undefined) customField.description = description;
    if (isActive !== undefined) customField.isActive = isActive;

    await customField.save();

    const populatedField = await customField.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Custom field updated successfully',
      data: populatedField,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom field (soft delete)
// @route   DELETE /api/custom-fields/:id
// @access  Private (Superuser only)
export const deleteCustomField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forceDelete = String(req.query.force).toLowerCase() === 'true';

    const customField = await CustomField.findById(id);
    if (!customField) {
      throw new ApiError(404, 'Custom field not found');
    }

    const fieldPath = `dynamicFields.${customField.name}`;
    const affectedCount = await Enquiry.countDocuments({ [fieldPath]: { $exists: true, $ne: null } });

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
        { [fieldPath]: { $exists: true } },
        { $unset: { [fieldPath]: '' } }
      );
    }

    await CustomField.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully',
      affectedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create custom field (used during Excel import)
// @route   POST /api/custom-fields/auto-create
// @access  Private (Superuser only)
export const getOrCreateCustomField = async (req, res, next) => {
  try {
    const { name, label, type } = req.body;

    if (!name || !label) {
      throw new ApiError(400, 'Name and label are required');
    }

    // Try to find existing field
    let customField = await CustomField.findOne({ name });

    // If not found, create new one (only for superuser)
    if (!customField) {
      customField = await CustomField.create({
        name,
        label,
        type: type || 'text',
        createdBy: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      data: customField,
    });
  } catch (error) {
    next(error);
  }
};
