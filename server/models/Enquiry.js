import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined before auto-generation
    },
    poNumber: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      required: false, // Made optional since Excel data may not have this
      trim: true,
      default: 'N/A',
    },
    enquiryDate: {
      type: Date,
      required: false, // Made optional, will use default if not provided
      default: Date.now,
    },
    dateReceived: {
      type: Date,
    },
    dateSubmitted: {
      type: Date,
    },
    marketType: {
      type: String,
      enum: ['Domestic', 'Export'],
      required: true,
    },
    productType: {
      type: String,
      enum: ['SP', 'NSP', 'SP+NSP', 'Other'],
      required: true,
    },
    supplyScope: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
    },
    estimatedValue: {
      type: Number,
    },
    // Department status fields
    drawingStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Not Required'],
      default: 'Pending',
    },
    costingStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Not Required'],
      default: 'Pending',
    },
    rndStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Not Required'],
      default: 'Pending',
    },
    salesStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Not Required'],
      default: 'Pending',
    },
    // Manufacturing type
    manufacturingType: {
      type: String,
      enum: ['Inhouse', 'Broughtout', 'Both'],
    },
    salesRepresentative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salesRepName: {
      type: String,
      required: true,
    },
    rndHandler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rndHandlerName: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    activity: {
      type: String,
      enum: ['Quoted', 'Regretted', 'In Progress', 'On Hold'],
      default: 'In Progress',
    },
    quotationDate: {
      type: Date,
    },
    fulfillmentTime: {
      type: Number, // in days
    },
    daysRequiredForFulfillment: {
      type: Number, // Expected days for fulfillment
    },
    closureDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Dynamic fields store custom column values
    dynamicFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate enquiry number before saving
enquirySchema.pre('save', async function (next) {
  // Only auto-generate if this is a new document AND enquiryNumber is not already set
  if (this.isNew && !this.enquiryNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the last enquiry number for this month
    const lastEnquiry = await this.constructor
      .findOne({
        enquiryNumber: new RegExp(`^ENQ-${year}${month}-`),
      })
      .sort({ enquiryNumber: -1 });

    let sequence = 1;
    if (lastEnquiry) {
      const lastSequence = parseInt(lastEnquiry.enquiryNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    this.enquiryNumber = `ENQ-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Calculate fulfillment time before saving
enquirySchema.pre('save', function (next) {
  if (this.quotationDate && this.enquiryDate) {
    const diffTime = Math.abs(this.quotationDate - this.enquiryDate);
    this.fulfillmentTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
