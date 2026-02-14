/**
 * Role-based Column Access Control
 * Defines which columns each role can edit in the Enquiry system
 */

// Define editable fields by role
export const ROLE_PERMISSIONS = {
  admin: {
    canEdit: 'all', // Admin can edit all fields
    editableFields: [], // Empty array means all fields
  },
  sales: {
    canEdit: 'specific',
    editableFields: [
      'poNumber',
      'customerName',
      'enquiryDate',
      'dateReceived',
      'dateSubmitted',
      'marketType',
      'supplyScope',
      'quantity',
      'estimatedValue',
      'salesStatus',
      'status', // Open/Closed
      'activity', // Quoted/Regretted/In Progress/On Hold
      'quotationDate',
      'closureDate',
      'remarks',
      'salesRepresentative',
      'salesRepName',
    ],
  },
  'r&d': {
    canEdit: 'specific',
    editableFields: [
      'drawingStatus',
      'costingStatus',
      'rndStatus',
      'productType', // SP/NSP/SP+NSP
      'manufacturingType', // Inhouse/Broughtout/Both
      'daysRequiredForFulfillment',
      'rndHandler',
      'rndHandlerName',
    ],
  },
  management: {
    canEdit: 'none', // Management can only view, not edit
    editableFields: [],
  },
};

// Fields that are always read-only (system-generated)
export const READ_ONLY_FIELDS = [
  '_id',
  'enquiryNumber',
  'createdBy',
  'createdAt',
  'updatedAt',
  'fulfillmentTime', // Auto-calculated
  '__v',
];

/**
 * Filter request body based on user role permissions
 * @param {Object} body - Request body with all fields
 * @param {String} userRole - User's role (admin, sales, r&d, management)
 * @returns {Object} - Filtered body with only allowed fields
 */
export const filterEditableFields = (body, userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];

  if (!permissions) {
    throw new Error(`Invalid role: ${userRole}`);
  }

  // Management cannot edit anything
  if (permissions.canEdit === 'none') {
    return {};
  }

  // Admin can edit all fields
  if (permissions.canEdit === 'all') {
    // Remove read-only fields
    const filtered = { ...body };
    READ_ONLY_FIELDS.forEach(field => delete filtered[field]);
    return filtered;
  }

  // For specific roles, filter to only allowed fields
  const filtered = {};
  permissions.editableFields.forEach(field => {
    if (body[field] !== undefined && !READ_ONLY_FIELDS.includes(field)) {
      filtered[field] = body[field];
    }
  });

  return filtered;
};

/**
 * Validate if a user can edit specific fields
 * @param {Array} fields - Fields being edited
 * @param {String} userRole - User's role
 * @returns {Object} - { canEdit: boolean, deniedFields: [] }
 */
export const validateFieldAccess = (fields, userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];

  if (!permissions) {
    return { canEdit: false, deniedFields: fields };
  }

  if (permissions.canEdit === 'none') {
    return { canEdit: false, deniedFields: fields };
  }

  if (permissions.canEdit === 'all') {
    return { canEdit: true, deniedFields: [] };
  }

  const deniedFields = fields.filter(
    field => !permissions.editableFields.includes(field) && !READ_ONLY_FIELDS.includes(field)
  );

  return {
    canEdit: deniedFields.length === 0,
    deniedFields,
  };
};

/**
 * Middleware to enforce role-based field editing
 */
export const enforceFieldPermissions = (req, res, next) => {
  try {
    const userRole = req.user.role;
    const originalBody = { ...req.body };

    // Filter body to only include fields the user can edit
    const filteredBody = filterEditableFields(originalBody, userRole);

    // Check if user tried to edit fields they don't have access to
    const attemptedFields = Object.keys(originalBody);
    const allowedFields = Object.keys(filteredBody);
    const deniedFields = attemptedFields.filter(f => !allowedFields.includes(f) && !READ_ONLY_FIELDS.includes(f));

    // If management tries to edit, deny immediately
    if (userRole === 'management' && attemptedFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Management users have read-only access',
      });
    }

    // Log warning if user tried to edit restricted fields
    if (deniedFields.length > 0) {
      console.warn(`User ${req.user.email} (${userRole}) attempted to edit restricted fields:`, deniedFields);
    }

    // Replace request body with filtered version
    req.body = filteredBody;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enforcing field permissions',
      error: error.message,
    });
  }
};

/**
 * Get editable fields for current user (for frontend)
 */
export const getEditableFields = (req, res) => {
  try {
    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole];

    res.status(200).json({
      success: true,
      data: {
        role: userRole,
        canEdit: permissions.canEdit,
        editableFields: permissions.editableFields,
        readOnlyFields: READ_ONLY_FIELDS,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving permissions',
      error: error.message,
    });
  }
};
