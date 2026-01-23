# Sales Enquiry Project Data Reference

## Features/Columns from Excel Task List

| No. | Column Name                 | Description                                    | Data Type | Sample Values                |
|-----|-----------------------------|------------------------------------------------|-----------|------------------------------|
| 1   | SR. No.                    | Serial number for each enquiry                  | Integer   | 1, 2, 3, 428                 |
| 2   | Enq No.                    | Unique enquiry identifier (Primary Key)         | String    | FC52E0002, FCEX52E0001       |
| 3   | EXPORT / DOMESTIC          | Market segment                                 | String    | DOMESTIC, EXPORT             |
| 4   | PO No.                     | Purchase order number                          | String    | "-", (mostly empty)          |
| 5   | DATE RECEIVED              | Enquiry received date                          | Date/Time | 2025-04-02 00:00:00          |
| 6   | DATE SUBMITTED             | Quotation submitted date                       | Date/Time | 2025-04-04 00:00:00          |
| 7   | DRAWING                    | Drawing requirement status                     | Boolean   | Y, N                         |
| 8   | COSTING                    | Costing completed status                       | Boolean   | Y, N                         |
| 9   | R&D                        | R&D representative name                        | String    | SANTOSH, SUSHILA, DEELIP     |
| 10  | SALES                      | Sales representative name                      | String    | MALINI, CHINNAMALLA, SEEMA   |
| 11  | OPEN / CLOSED              | Enquiry status                                 | String    | OPEN, CLOSED                 |
| 12  | ACTIVITY                   | Current activity status                        | String    | QUOTED, REGRETED, IN-HOUSE   |
| 13  | SCOPE OF SUPPLY            | Supply scope categorization                    | String    | IN-HOUSE, BO, IN-HOUSE & BO  |
| 14  | PRODUCT TYPE               | Product classification                         | String    | SP, NSP, SP & NSP            |
| 15  | DAYS TO COMPLETE           | Fulfillment duration in days                   | Integer   | 0, 1, 2, 33                  |
| 16  | REMARK                     | Additional notes/comments                      | String    | Delayed due to unavailability|

---

## Data Quality & Usage Notes
- Boolean fields (DRAWING, COSTING) use "Y"/"N" as values
- PO No. is mostly blank
- Remarks appear for entries with delays or issues
- Product type occasionally includes both SP & NSP

---

## Data Model Example (for implementation)

```javascript
{
  enquiryNumber: String,      // Enq No.
  marketSegment: String,      // EXPORT / DOMESTIC
  purchaseOrder: String,      // PO No.
  dateReceived: Date,         // DATE RECEIVED
  dateSubmitted: Date,        // DATE SUBMITTED
  drawingRequired: Boolean,   // DRAWING
  costingDone: Boolean,       // COSTING
  rndPerson: String,          // R&D
  salesPerson: String,        // SALES
  status: String,             // OPEN / CLOSED
  activity: String,           // ACTIVITY
  supplyScope: String,        // SCOPE OF SUPPLY
  productType: String,        // PRODUCT TYPE
  fulfillmentDays: Integer,   // DAYS TO COMPLETE
  remark: String              // REMARK
}
```

### Example row:
```json
{
  enquiryNumber: "FC52E0002",
  marketSegment: "DOMESTIC",
  purchaseOrder: "-",
  dateReceived: "2025-04-02T00:00:00",
  dateSubmitted: "2025-04-04T00:00:00",
  drawingRequired: false,
  costingDone: true,
  rndPerson: "SUSHILA",
  salesPerson: "MALINI",
  status: "CLOSED",
  activity: "QUOTED",
  supplyScope: "IN-HOUSE & BO",
  productType: "SP",
  fulfillmentDays: 2,
  remark: ""
}
```

---
