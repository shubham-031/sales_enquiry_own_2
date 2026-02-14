import Enquiry from '../models/Enquiry.js';
import { ApiError } from '../middlewares/errorHandler.js';

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private
export const getEnquiries = async (req, res, next) => {
  try {
    const { status, activity, marketType, startDate, endDate, search } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (activity) filter.activity = activity;
    if (marketType) filter.marketType = marketType;

    if (startDate || endDate) {
      filter.enquiryDate = {};
      if (startDate) filter.enquiryDate.$gte = new Date(startDate);
      if (endDate) filter.enquiryDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { enquiryNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    const enquiries = await Enquiry.find(filter)
      .populate('salesRepresentative', 'name email')
      .populate('rndHandler', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
// @access  Private
export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('salesRepresentative', 'name email department')
      .populate('rndHandler', 'name email department')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!enquiry) {
      throw new ApiError(404, 'Enquiry not found');
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new enquiry
// @route   POST /api/enquiries
// @access  Private (Sales, R&D, Superuser)
export const createEnquiry = async (req, res, next) => {
  try {
    // Separate static and dynamic fields
    const staticFields = [
      'enquiryNumber',
      'poNumber',
      'customerName',
      'enquiryDate',
      'dateReceived',
      'dateSubmitted',
      'marketType',
      'productType',
      'supplyScope',
      'quantity',
      'estimatedValue',
      'drawingStatus',
      'costingStatus',
      'rndStatus',
      'salesStatus',
      'manufacturingType',
      'salesRepresentative',
      'salesRepName',
      'rndHandler',
      'rndHandlerName',
      'status',
      'activity',
      'quotationDate',
      'fulfillmentTime',
      'daysRequiredForFulfillment',
      'closureDate',
      'remarks',
      'attachments',
      'dynamicFields', // ✅ IMPORTANT: if frontend sends nested dynamicFields
    ];

    const enquiryData = {};
    const dynamicFields = {};

    // Separate dynamic from static fields
    for (const [key, value] of Object.entries(req.body)) {
      if (staticFields.includes(key)) {
        enquiryData[key] = value;
      } else {
        dynamicFields[key] = value;
      }
    }

    // Attach metadata
    enquiryData.createdBy = req.user.id;

    // Aashish logic: creator becomes sales rep by default
    enquiryData.salesRepName = req.user.name;
    enquiryData.salesRepresentative = req.user.id;

    // ✅ Handle dynamic fields:
    // Case 1: frontend sends { dynamicFields: {...} }
    // Case 2: backend receives extra keys that are dynamic
    const nestedDynamic = enquiryData.dynamicFields && typeof enquiryData.dynamicFields === 'object'
      ? enquiryData.dynamicFields
      : {};

    const mergedDynamic = { ...nestedDynamic, ...dynamicFields };

    if (Object.keys(mergedDynamic).length > 0) {
      enquiryData.dynamicFields = mergedDynamic;
    } else {
      delete enquiryData.dynamicFields;
    }

    const enquiry = await Enquiry.create(enquiryData);

    res.status(201).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry
// @route   PUT /api/enquiries/:id
// @access  Private (Sales, R&D, Admin) - Field permissions enforced
export const updateEnquiry = async (req, res, next) => {
  try {
    let enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      throw new ApiError(404, 'Enquiry not found');
    }

    // Aashish behavior:
    // If permission middleware filtered all fields out, req.body becomes empty
    if (Object.keys(req.body).length === 0) {
      return res.status(403).json({
        success: false,
        message: `Your role (${req.user.role}) does not have permission to edit the requested fields`,
      });
    }

    // Separate static and dynamic fields
    const staticFields = [
      'enquiryNumber',
      'poNumber',
      'customerName',
      'enquiryDate',
      'dateReceived',
      'dateSubmitted',
      'marketType',
      'productType',
      'supplyScope',
      'quantity',
      'estimatedValue',
      'drawingStatus',
      'costingStatus',
      'rndStatus',
      'salesStatus',
      'manufacturingType',
      'salesRepresentative',
      'salesRepName',
      'rndHandler',
      'rndHandlerName',
      'status',
      'activity',
      'quotationDate',
      'fulfillmentTime',
      'daysRequiredForFulfillment',
      'closureDate',
      'remarks',
      'attachments',
      'dynamicFields', // ✅ allow nested dynamicFields updates too
    ];

    const updateData = { updatedBy: req.user.id };
    const dynamicUpdates = {};

    // Split updates
    for (const [key, value] of Object.entries(req.body)) {
      if (staticFields.includes(key)) {
        updateData[key] = value;
      } else {
        dynamicUpdates[key] = value;
      }
    }

    // ✅ Merge dynamic fields safely:
    // - if request contains nested dynamicFields, merge that too
    const nestedDynamic =
      updateData.dynamicFields && typeof updateData.dynamicFields === 'object'
        ? updateData.dynamicFields
        : {};

    const mergedDynamic = {
      ...(enquiry.dynamicFields || {}),
      ...nestedDynamic,
      ...dynamicUpdates,
    };

    if (Object.keys(mergedDynamic).length > 0) {
      updateData.dynamicFields = mergedDynamic;
    } else {
      delete updateData.dynamicFields;
    }

    enquiry = await Enquiry.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('salesRepresentative', 'name email department')
      .populate('rndHandler', 'name email department')
      .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private (Admin only)
export const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      throw new ApiError(404, 'Enquiry not found');
    }

    await enquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all enquiries (Admin only)
// @route   DELETE /api/enquiries/all
// @access  Private (Admin only)
export const deleteAllEnquiries = async (req, res, next) => {
  try {
    const result = await Enquiry.deleteMany({});

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} enquiries`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload attachment to enquiry
// @route   POST /api/enquiries/:id/attachments
// @access  Private
export const uploadAttachment = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      throw new ApiError(404, 'Enquiry not found');
    }

    // File upload logic will be implemented with multer
    // This is a placeholder
    res.status(200).json({
      success: true,
      message: 'File upload endpoint - to be implemented',
    });
  } catch (error) {
    next(error);
  }
};
