# Dynamic Columns API Reference

## Base URL
```
http://localhost:5000/api/custom-fields
```

## Authentication
All endpoints require JWT token in cookies or Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get All Custom Fields
```http
GET /api/custom-fields
```

**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "5f7b3c1234567890abcdef01",
      "name": "customer_budget",
      "label": "Customer Budget",
      "type": "number",
      "isRequired": true,
      "description": "Total budget allocated",
      "options": [],
      "createdBy": {
        "_id": "5f7a1b2c3d4e5f6g7h8i9j0k",
        "name": "System Owner",
        "email": "superuser@example.com"
      },
      "isActive": true,
      "createdAt": "2026-02-12T10:30:00Z",
      "updatedAt": "2026-02-12T10:30:00Z"
    }
  ]
}
```

---

### 2. Create Custom Field
```http
POST /api/custom-fields
Content-Type: application/json

{
  "name": "customer_budget",
  "label": "Customer Budget",
  "type": "number",
  "isRequired": true,
  "description": "Total budget allocated"
}
```

**Authorization:** Superuser only

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Unique field identifier (lowercase, underscores) |
| label | string | ✅ | Display name for UI |
| type | string | ❌ | text\|number\|date\|boolean\|select (default: text) |
| isRequired | boolean | ❌ | Field is mandatory (default: false) |
| description | string | ❌ | Help text for users |
| options | string[] | ❌ | For type=select only |

**Validation Rules:**
- `name`: Must be lowercase, letters/numbers/underscores only
- `name`: Must be unique in database
- `label`: Required and non-empty
- `type`: Must be one of 5 allowed types

**Success Response (201):**
```json
{
  "success": true,
  "message": "Custom field created successfully",
  "data": {
    "_id": "5f7b3c1234567890abcdef01",
    "name": "customer_budget",
    "label": "Customer Budget",
    "type": "number",
    "isRequired": true,
    "description": "Total budget allocated",
    "options": [],
    "createdBy": { ... },
    "isActive": true,
    "createdAt": "2026-02-12T10:30:00Z",
    "updatedAt": "2026-02-12T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// 400 - Missing required fields
{
  "success": false,
  "message": "Name and label are required"
}

// 400 - Duplicate field name
{
  "success": false,
  "message": "Custom field with name 'customer_budget' already exists"
}

// 403 - Not authorized
{
  "success": false,
  "message": "User role 'sales' is not authorized to access this route"
}
```

---

### 3. Update Custom Field
```http
PUT /api/custom-fields/:id
Content-Type: application/json

{
  "label": "Customer Budget (Updated)",
  "description": "Updated description",
  "isRequired": false
}
```

**Authorization:** Superuser only

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | ObjectId | ✅ | Field ID to update |

**Request Body (all optional):**
| Field | Type | Notes |
|-------|------|-------|
| label | string | Cannot update name (internal identifier) |
| type | string | Cannot change after creation |
| description | string | Help text |
| isRequired | boolean | Required flag |
| isActive | boolean | For soft deletion |
| options | string[] | For select type |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Custom field updated successfully",
  "data": { ... }
}
```

**Error Responses:**
```json
// 404 - Field not found
{
  "success": false,
  "message": "Custom field not found"
}
```

---

### 4. Delete Custom Field (Soft Delete)
```http
DELETE /api/custom-fields/:id
```

**Authorization:** Superuser only

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | ObjectId | ✅ | Field ID to delete |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Custom field deleted successfully"
}
```

**Note:** Soft deletion sets `isActive: false`. Data in enquiries is preserved.

---

### 5. Get or Create Custom Field (Auto-Create)
```http
POST /api/custom-fields/auto-create
Content-Type: application/json

{
  "name": "manufacturing_type",
  "label": "Manufacturing Type",
  "type": "text"
}
```

**Authorization:** Superuser only

**Use Case:** During Excel import to auto-create fields

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Field identifier |
| label | string | ✅ | Display name |
| type | string | ❌ | Default: text |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "manufacturing_type",
    "label": "Manufacturing Type",
    "type": "text",
    ... // full field object or existing field if found
  }
}
```

**Logic:**
1. Check if field with this `name` exists
2. If exists → return existing field
3. If not exists → create new field
4. Either way → return field object

---

## Integration with Enquiries

### Create Enquiry with Dynamic Fields
```http
POST /api/enquiries
Content-Type: application/json

{
  "customerName": "ABC Corp",
  "enquiryDate": "2026-02-12",
  "marketType": "Domestic",
  "productType": "SP",
  ... static fields ...,
  "customer_budget": 50000,
  "is_priority": true,
  "required_delivery_date": "2026-03-15"
}
```

**Processing:**
1. Server identifies static vs dynamic fields
2. Static fields: stored normally
3. Dynamic fields: merged into `dynamicFields` map
4. Result stored in MongoDB

**Stored as:**
```json
{
  "_id": ObjectId,
  "enquiryNumber": "ENQ-202602-0001",
  "customerName": "ABC Corp",
  ... static fields ...,
  "dynamicFields": {
    "customer_budget": 50000,
    "is_priority": true,
    "required_delivery_date": "2026-03-15"
  }
}
```

---

### Update Enquiry with Dynamic Fields
```http
PUT /api/enquiries/:id
Content-Type: application/json

{
  "customer_budget": 60000,
  "is_priority": false
}
```

**Processing:**
1. Existing `dynamicFields` preserved
2. New values merged in (don't overwrite all)
3. Only updated fields changed

**Example:**
Before:
```json
{
  "dynamicFields": {
    "customer_budget": 50000,
    "is_priority": true,
    "required_delivery_date": "2026-03-15"
  }
}
```

After update with `{ "customer_budget": 60000 }`:
```json
{
  "dynamicFields": {
    "customer_budget": 60000,  // ← Updated
    "is_priority": true,        // ← Preserved
    "required_delivery_date": "2026-03-15"  // ← Preserved
  }
}
```

---

## Export/Import Integration

### Excel Export
```http
POST /api/reports/export/excel
Content-Type: application/json

{
  "startDate": "2026-01-01",
  "endDate": "2026-02-28",
  "marketType": "Domestic"
}
```

**Excel Structure:**
```
| Enquiry# | Date | Customer | ... static cols ... | Customer Budget | Is Priority | Required Date |
|----------|------|----------|---------------------|-----------------|-------------|---|
| ENQ... | 2026-02-12 | ABC Corp | ... | 50000 | true | 2026-03-15 |
```

**Features:**
- All custom fields added as columns
- Field headers use `label` (display name)
- Empty values show blank
- Data exported in order: static → dynamic

---

### Excel Import
```http
POST /api/enquiries/bulk-import
Content-Type: multipart/form-data

[Excel file with custom columns]
```

**Processing:**
```
For each Excel row:
  1. Extract static columns → validate & store
  2. Extract unknown columns:
     a. Check if CustomField exists
     b. If exists → store in dynamicFields
     c. If not exists:
        - Superuser: auto-create CustomField
        - Non-superuser: skip column
```

**Example:**
```
Excel has columns: Enquiry#, Date, Customer, "Supplier Rating" (unknown)

Superuser imports:
- Creates CustomField: name="supplier_rating", label="Supplier Rating"
- Stores value in dynamicFields.supplier_rating

Non-superuser imports:
- Skips "Supplier Rating" column
- Other data imported normally
```

---

## Error Handling

### Common Error Codes

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 400 | Name and label are required | Missing field | Provide both name and label |
| 400 | Field name already exists | Duplicate | Choose unique name |
| 400 | Invalid field name | Bad format | Use lowercase + underscores |
| 403 | Not authorized | Wrong role | Require superuser |
| 404 | Custom field not found | ID invalid | Verify field exists |
| 500 | Internal server error | Server issue | Check server logs |

---

## Rate Limiting

No specific rate limits; inherits from API gateway.

---

## Pagination

Get all fields endpoint does not paginate (assumes < 100 fields typical).

To add pagination in future:
```javascript
GET /api/custom-fields?page=1&limit=10
```

---

## Versioning

Current API version: **v1**

Future versions may add:
- Pagination for fields
- Field history/audit trail
- Field dependencies
- Calculated fields

---

## Example Workflows

### Workflow 1: Create Field + Use in Form

**Request 1: Create field**
```bash
POST /api/custom-fields
{
  "name": "customer_budget",
  "label": "Customer Budget",
  "type": "number"
}
```

**Request 2: Get fields** (frontend does this)
```bash
GET /api/custom-fields
```

**Request 3: Create enquiry** (frontend submits form with custom field)
```bash
POST /api/enquiries
{
  "enquiryNumber": "ENQ-...",
  "marketType": "Domestic",
  ... other static fields ...,
  "customer_budget": 50000  ← Dynamic field
}
```

**Result:** Enquiry stored with `dynamicFields: { customer_budget: 50000 }`

---

### Workflow 2: Excel Import with Auto-Create

**File sent:** Excel with columns [Enquiry#, Date, "Supplier Rating"]

**Processing:**
1. Server reads Excel columns
2. Finds "Supplier Rating" is unknown
3. Calls: `POST /api/custom-fields/auto-create`
4. Creates: CustomField for "supplier_rating"
5. Stores value in enquiry's dynamicFields
6. Response: "Import completed - 10 records imported"

---

## Testing with cURL

### Get all fields
```bash
curl -X GET http://localhost:5000/api/custom-fields \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Create field
```bash
curl -X POST http://localhost:5000/api/custom-fields \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "customer_budget",
    "label": "Customer Budget",
    "type": "number"
  }'
```

### Delete field
```bash
curl -X DELETE http://localhost:5000/api/custom-fields/5f7b3c1234567890abcdef01 \
  -H "Authorization: Bearer <token>"
```

---

## Webhooks (Future)

Could add webhooks for events:
- `custom_field.created`
- `custom_field.updated`
- `custom_field.deleted`

---

## Documentation

For complete implementation details, see:
- `DYNAMIC_COLUMNS_IMPLEMENTATION.md` - Full architecture
- `DYNAMIC_COLUMNS_QUICKSTART.md` - User guide
- Source code comments in controller files

---

**Last Updated:** February 12, 2026  
**API Version:** 1.0  
**Status:** Production Ready ✅
