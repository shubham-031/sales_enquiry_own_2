import CustomField from '../models/CustomField.js';
import { ApiError } from '../middlewares/errorHandler.js';

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
    const { label, type, options, isRequired, description, isActive } = req.body;

    const customField = await CustomField.findById(id);
    if (!customField) {
      throw new ApiError(404, 'Custom field not found');
    }

    // Update only editable fields (name should not be changed)
    if (label) customField.label = label;
    if (type) customField.type = type;
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

    const customField = await CustomField.findById(id);
    if (!customField) {
      throw new ApiError(404, 'Custom field not found');
    }

    // Soft delete: set isActive to false
    customField.isActive = false;
    await customField.save();

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully',
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
