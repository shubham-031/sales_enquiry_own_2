# 🚀 Quick Setup to Test Excel Import Fix

## Step 1: Restart the Backend Server

```bash
# In terminal, stop current server (Ctrl+C)
# Then restart it:
npm start
```

Server should start on http://localhost:5000

---

## Step 2: Clear Existing Data (Optional but Recommended)

To test fresh import without interfering with existing data:

### Option A: Via MongoDB Compass
1. Connect to MongoDB (mongodb://localhost:27017)
2. Go to database: `sales_enquiry_dev`
3. Drop collection: `enquiries`
4. Refresh and verify it's empty

### Option B: Via Command Line
```bash
# In MongoDB shell
use sales_enquiry_dev
db.enquiries.deleteMany({})
```

---

## Step 3: Upload Your 430-Row Excel File

1. Open browser → http://localhost:5173
2. Login as Superuser
3. Go to **Enquiries** page
4. Click **Import Enquiries** button
5. Select your Excel file (SALES ENQUIRY TRACKER_Sample data_2025-26.xlsx)
6. Click **Upload**

---

## Step 4: Check Server Console

Watch the console output for:

```
📋 Excel File Reading:
Total data rows extracted: 430

📋 ============= COLUMN VALIDATION =============
Expected 16 Excel columns:
  1. SR. No. | 2. Enq No. | 3. EXPORT / DOMESTIC | ...
 
Actual columns in Excel file:
  1. "SR. No."
  2. "Enq No."
  3. "EXPORT / DOMESTIC"
  ...

✅ Column Mapping Check:
  ✅ "SR. No."
  ✅ "Enq No."
  ...
```

Then for first 10 rows:
```
=== Row 1 - Data Extraction ===
Enq No. extracted: "FC52E0519" (raw: "FC52E0519")

Dates: Recv="7/17/2025"→2025-07-17T00:00:00.000Z | Subm="8/4/2025"→2025-08-04T00:00:00.000Z

📝 Enquiry#FC52E0519: dates=YES, market=Domestic, activity=Quoted
   ✅ Created new enquiry
```

---

## Step 5: Check Portal Data

After import completes, go to **Enquiries** list:

### Verify Column Headers Show:
- ✅ Enquiry # (should show: FC52E0519, FC52E0532, not ENQ-202602-XXXX)
- ✅ Customer
- ✅ PO Number
- ✅ Date Received (should show: 7/17/2025, not N/A)
- ✅ Date Submitted (should show: 8/4/2025, not N/A)  
- ✅ Market (Domestic/Export)
- ✅ Product (SP/NSP)
- ✅ Drawing (Completed/Not Required)
- ✅ Costing (Completed/Not Required)
- ✅ R&D (CHINNAMALLA, VINAYA, MALINI, etc.)
- ✅ Sales (SANTOSH, SUSHILA, etc.)
- ✅ And more...

### Verify Data Distribution:
- **Total rows**: 430
- **Enquiry numbers**: FC52E0519, FC52E0532, FC52E0539... (NOT auto-generated ENQ numbers)
- **Dates**: Actual dates, not N/A
- **Market**: 214 Domestic, 43 Export
- **Status**: 255 Closed, 2 Open
- **Activity**: 218 Quoted, 33 Regretted

---

## Step 6: Click a Single Enquiry to View Details

Click on first enquiry (FC52E0519):

Should show:
- ✅ Enquiry Number: FC52E0519 (not ENQ-202602-XXXX)
- ✅ Date Received: 7/17/2025
- ✅ Date Submitted: 8/4/2025
- ✅ Market Type: Domestic
- ✅ Drawing Status: Not Required (N→Not Required)
- ✅ Costing Status: Completed (Y→Completed)
- ✅ R&D Handler: CHINNAMALLA
- ✅ Sales Rep: SANTOSH
- ✅ Activity: Quoted
- ✅ Status: Closed
- ✅ Manufacturing Type: (Inhouse/Broughtout based on SCOPE OF SUPPLY)
- ✅ Product Type: SP/NSP
- ✅ Days Required: 0
- ✅ Remarks: (actual remark text)

---

## Expected Results ✅

| Portal Data | Expected | Current (Wrong) | Fixed |
|---|---|---|---|
| Enquiry Numbers | FC52E0519, FC52E0532... | ENQ-202602-0172... | ✅ Fixed |
| Dates | 7/17/2025, 8/4/2025... | N/A | ✅ Fixed |
| Drawing | Y/N→ Completed/Not Req | N/A | ✅ Fixed |
| R&D Names | CHINNAMALLA, MALINI... | N/A | ✅ Fixed |
| Sales Names | SANTOSH, SUSHILA... | N/A | ✅ Fixed |
| Activity | QUOTED, REGRETED... | N/A | ✅ Fixed |
| Status | CLOSED, OPEN... | N/A | ✅ Fixed |

---

## Troubleshooting

### Issue: Import doesn't show 430 rows
**Check**: Server console - look for errors in row extraction

### Issue: Enquiry numbers still showing ENQ-202602-XXXX  
**Check**: Server console for "Enq No. extracted: ..." - if shows empty, column mapping failed

### Issue: Dates still showing N/A
**Check**: Server console for date parsing messages

### Issue: Names showing wrong values  
**Check**: R&D and SALES names being extracted - should match Excel

---

## Files Modified

1. ✅ `server/utils/columnMapper.js` - Enhanced column mappings
2. ✅ `server/controllers/importController.js` - Better header detection & logging  
3. ✅ `server/models/Enquiry.js` - Improved auto-generation logic
4. ✅ Enhanced logging throughout import process

---

## Next Steps After Testing

If all data shows correctly:
1. Verify export includes all columns
2. Test edit → save → view cycle
3. Check API response structure
4. Run production import

If issues remain:
1. Check server console carefully for error messages
2. Verify Excel file structure matches expected 16 columns
3. Test with sample 5-row file first
