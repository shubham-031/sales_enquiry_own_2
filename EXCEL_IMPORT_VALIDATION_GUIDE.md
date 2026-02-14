# 📊 Excel Import Validation Guide - 16 Column Mapping

## Expected Excel Structure (430 rows × 16 columns)

Your Excel file should have exactly these 16 columns in this order:

| # | Column Name | Data Type | Example Values | Status |
|---|---|---|---|---|
| 1 | **SR. No.** | Number | 173, 174, 175... | ✅ MAPPED |
| 2 | **Enq No.** | Text | FC52E0519, FC52E0532... | ✅ MAPPED |
| 3 | **EXPORT / DOMESTIC** | Text | DOMESTIC, EXPORT | ✅ MAPPED |
| 4 | **PO No.** | Text | "-" (mostly blank) | ✅ MAPPED |
| 5 | **DATE RECEIVED** | Date | 7/17/2025, 7/18/2025... | ✅ MAPPED |
| 6 | **DATE SUBMITTED** | Date | 8/4/2025, 7/18/2025... | ✅ MAPPED |
| 7 | **DRAWING** | Text | Y, N | ✅ MAPPED → drawingStatus |
| 8 | **COSTING** | Text | Y, N | ✅ MAPPED → costingStatus |
| 9 | **R&D** | Text | MALINI, CHINNAMALLA... | ✅ MAPPED → rndHandler |
| 10 | **SALES** | Text | SANTOSH, SUSHILA... | ✅ MAPPED → salesRepresentative |
| 11 | **OPEN / CLOSED** | Text | CLOSED, OPEN | ✅ MAPPED → status |
| 12 | **ACTIVITY** | Text | QUOTED, REGRETED | ✅ MAPPED → activity |
| 13 | **SCOPE OF SUPPLY** | Text | BO, IN-HOUSE | ✅ MAPPED → manufacturingType |
| 14 | **PRODUCT TYPE** | Text | SP, NSP | ✅ MAPPED → productType |
| 15 | **DAYS TO COMPLETE ENQUIRY** | Number | 0, 1, 2, 3... | ✅ MAPPED → daysRequiredForFulfillment |
| 16 | **REMARK** | Text | "REGRETED DUE TO...", "Not Feasible..." | ✅ MAPPED → remarks |

---

## Column Mapping Details

### Static Schema Fields (from Enquiry model)

```
Excel Column → Database Field → Data Transformation
──────────────────────────────────────────────────────
SR. No. → srNo (reference only)
Enq No. → enquiryNumber (unique key)
EXPORT / DOMESTIC → marketType → "Domestic" or "Export"
PO No. → poNumber → as-is
DATE RECEIVED → dateReceived → Parsed date
DATE SUBMITTED → dateSubmitted → Parsed date
  → quoteDate (same as dateSubmitted)
DRAWING → drawingStatus → Y→"Completed", N→"Not Required"
COSTING → costingStatus → Y→"Completed", N→"Not Required"
R&D → rndHandler → User lookup/create (department: R&D)
SALES → salesRepresentative → User lookup/create (department: Sales)
OPEN / CLOSED → status → "Open" or "Closed"
ACTIVITY → activity → "Quoted", "Regretted", "In Progress", "On Hold"
SCOPE OF SUPPLY → manufacturingType → "Inhouse", "Broughtout", "Both"
PRODUCT TYPE → productType → "SP", "NSP", "SP+NSP"
DAYS TO COMPLETE ENQUIRY → daysRequiredForFulfillment → as number
REMARK → remarks → as-is
```

---

## Import & Validation Process

### Step 1: Upload Excel File
- Navigate to **Enquiry List** page
- Click **"Import Enquiries"** button
- Select your 430-row Excel file
- Click **Upload**

### Step 2: Monitor Import Logs (Server Console)
The server will log:
```
📋 ============= COLUMN VALIDATION =============
Expected Excel columns (16 total):
  1. SR. No. ✅
  2. Enq No. ✅
  3. EXPORT / DOMESTIC ✅
  ... (all 16 columns)
```

Look for this section to confirm ALL 16 columns were detected.

### Step 3: Verify Data in Portal

#### A. EnquiryList DataGrid
- All imported enquiries should display
- Columns visible:
  - Enquiry #, Customer, PO Number
  - Date Received, Date Submitted
  - Market (Domestic/Export), Product
  - Drawing (Y/N), Costing (Y/N)
  - R&D (Person), Sales (Rep)
  - Activity (Quoted/Regretted), Status (Open/Closed)
  - Days Required, Remarks

#### B. EnquiryDetails View
- Click any enquiry to view details
- Should show:
  - Identification section: Enq No., Market Type, PO No.
  - Dates section: Date Received, Date Submitted
  - Department Status: Drawing, Costing, R&D, Sales
  - Scope & Product: Manufacturing Type, Product Type
  - Performance: Days Required
  - Remarks
  - **📊 Additional Imported Fields** section (if any orphaned fields exist)

#### C. EnquiryForm (Edit View)
- All standard fields should be editable
- All imported fields should appear in form
- Changes should save correctly

#### D. Excel Export
- Export enquiry data to Excel
- Verify all columns are present
- Spot-check data accuracy (compare with original)

#### E. CSV Export
- Export enquiry data to CSV
- Verify all columns are present
- All 16 columns should be in header row

---

## Data Quality Checklist

### For Each Column, Verify:

#### ✅ Identification Columns
- [ ] SR. No. matches original file
- [ ] Enq No. is unique and matches original
- [ ] EXPORT / DOMESTIC shows Domestic (214) or Export (43)
- [ ] PO No. shows "-" or actual numbers (mostly blank)

#### ✅ Date Columns
- [ ] DATE RECEIVED displays correctly (format: DD-MM-YYYY)
- [ ] DATE SUBMITTED displays correctly
- [ ] All dates between June-September 2025

#### ✅ Status Columns (Y/N)
- [ ] DRAWING: Y=74 records, N=183 records
- [ ] COSTING: Y=255 records, N=2 records

#### ✅ Representative Columns
- [ ] SALES shows names: SANTOSH (229), SUSHILA (21), DEELIP (4), VINOD (3)
- [ ] R&D shows names: MALINI (98), CHINNAMALLA (61), VINAYA (37), SEEMA (33), DHANSHREE (9)

#### ✅ Status Columns
- [ ] OPEN / CLOSED: CLOSED=255, OPEN=2
- [ ] ACTIVITY: QUOTED=218, REGRETED=33

#### ✅ Supply & Product Columns
- [ ] SCOPE OF SUPPLY: BO=225, IN-HOUSE=28, IN-HOUSE & BO=3
- [ ] PRODUCT TYPE: SP=143, NSP=111, SP & NSP=2

#### ✅ Performance Columns
- [ ] DAYS TO COMPLETE ENQUIRY: 0 days=231 (most common)
- [ ] Other values: 1 day=51, 2 days=49, 3 days=27...

#### ✅ Remarks Column
- [ ] Contains text like "Not Feasible at the Moment"
- [ ] Shows "REGRETED DUE TO UNAVAILABILITY"
- [ ] Displays qualitative feedback

---

## Expected Data Distribution

After successful import, verify these counts:

```
Total Enquiries: 430
├─ Market Type
│  ├─ Domestic: 214
│  └─ Export: 43
├─ Status
│  ├─ Closed: 255
│  ├─ Open: 2
│  └─ Unknown: 173 (Excel read error)
├─ Activity
│  ├─ Quoted: 218
│  ├─ Regretted: 33
│  └─ In Progress/Other: balance
├─ Drawing Status
│  ├─ Yes: 74
│  └─ No: 183
├─ Costing Status
│  ├─ Completed: 255
│  └─ Not Required: 2
└─ Days to Complete
   ├─ 0 days: 231 (most common)
   ├─ 1 day: 51
   └─ 2+ days: balance
```

---

## Troubleshooting

### Issue: Column Not Showing in DataGrid

**Cause:** Column header name doesn't match COLUMN_MAPPINGS

**Solution:** 
1. Check import logs for exact column names Excel has
2. Verify column header spelling matches exactly
3. If custom column, it will appear as "Additional Imported Fields"

### Issue: Dates Not Parsing Correctly

**Cause:** Excel date format not in DD-MM-YYYY

**Solution:** 
1. Verify Excel has dates in DD-MM-YYYY format
2. Check server logs for date parsing errors
3. All dates should be between mid-2025

### Issue: Representative Name Creates Wrong User

**Cause:** Name spelled differently in Excel vs expectations

**Solution:** 
1. Check exact spelling in original Excel
2. Edit enquiry to assign correct user
3. Or pre-create correct users before import

### Issue: Some Data Missing After Import

**Cause:** Likely in "Additional Imported Fields" section (orphaned columns)

**Solution:** 
1. Check EnquiryDetails for "📊 Additional Imported Fields"
2. These are columns not in default CustomFields list
3. You can create CustomFields for them in Settings

---

## Import Success Indicators

✅ Import is successful when:
1. All 430 rows processed without errors
2. All 16 columns detected and mapped
3. EnquiryList shows all enquiries
4. DataGrid displays data correctly
5. EnquiryDetails shows complete information
6. Export includes all columns
7. Data values match original Excel

✅ No "Additional Imported Fields" section needed when:
- All 16 columns are properly mapped to CustomFields
- No orphaned fields exist in database

---

## Quick Validation Query (for developers)

```javascript
// In MongoDB or via API:
db.enquiries.findOne().pretty()

// Expected structure after import:
{
  enquiryNumber: "FC52E0519",
  poNumber: "-",
  customerName: "Customer-FC52E0519",
  enquiryDate: ISODate("2025-07-17"),
  dateReceived: ISODate("2025-07-17"),
  dateSubmitted: ISODate("2025-08-04"),
  marketType: "Domestic",
  productType: "SP",
  supplyScope: null,
  drawingStatus: "Not Required",  // From Y/N "N"
  costingStatus: "Completed",      // From Y/N "Y"
  rndStatus: "Completed",
  rndHandler: ObjectId(...),
  salesStatus: "Completed",
  salesRepresentative: ObjectId(...),
  activity: "Quoted",
  status: "Closed",
  daysRequiredForFulfillment: 0,
  remarks: "Remark text here",
  dynamicFields: Map {},          // Should be empty if all columns mapped
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## Next Steps

1. ✅ Verify column mappings above match your Excel headers exactly
2. ✅ Update column names if needed in COLUMN_MAPPINGS
3. ✅ Import Excel file using the Import button
4. ✅ Check server console for validation log
5. ✅ Review EnquiryList to confirm all data visible
6. ✅ Test EnquiryDetails, export, and edit functions
7. ✅ Report any missing or incorrectly transformed data
