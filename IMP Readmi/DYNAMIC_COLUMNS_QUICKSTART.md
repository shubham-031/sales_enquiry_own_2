# Dynamic Columns - Quick Start Guide

## 🚀 Quick Setup for Superuser

### Step 1: Access Manage Columns
1. Login as **Superuser**
2. Navigate to **Settings → Manage Columns** (add this to your menu)
3. You'll see existing custom fields (if any)

### Step 2: Create Your First Custom Field
1. Click **"Add New Column"** button
2. Fill out the form:
   ```
   Internal Name: customer_budget
   Display Label: Customer Budget
   Type: number
   Required: Yes
   Description: Total budget allocated by customer
   ```
3. Click **"Create"**
4. Field appears immediately in the list

### Step 3: Use in Enquiry Form
1. Go to **Enquiries → Create New Enquiry**
2. Scroll to **"Additional Custom Fields"** section
3. You'll see **"Customer Budget"** input field
4. Fill in the value and save
5. Enquiry now has the custom field stored

### Step 4: View in DataGrid
1. Go to **Enquiries List**
2. A new column appears: **"Customer Budget"**
3. Your entered value displays in the row
4. Works for all enquiries with this field

### Step 5: Export to Excel
1. Click **"Export to Excel"**
2. Download includes the **"Customer Budget"** column
3. All custom fields automatically included

---

## 📝 Custom Field Types Explained

| Type | Example Input | Use Case |
|------|----------|----------|
| **text** | "ABC Industries" | Company names, descriptions, notes |
| **number** | 50000 | Budget, quantity, cost |
| **date** | 2026-02-15 | Dates (delivery, payment, etc.) |
| **boolean** | ☑ Yes | Flags (premium customer, fast-track, etc.) |
| **select** | Dropdown options | Status, category, rating |

---

## 🎯 Common Use Cases

### Example 1: Budget Tracking
- **Name:** `customer_budget`
- **Label:** Customer Budget
- **Type:** number
- **Use:** Track budget allocated per enquiry

### Example 2: Priority Flag
- **Name:** `is_priority`
- **Label:** Priority Enquiry
- **Type:** boolean
- **Use:** Mark urgent/important enquiries

### Example 3: Delivery Date
- **Name:** `required_delivery_date`
- **Label:** Required Delivery Date
- **Type:** date
- **Use:** Track customer deadlines

### Example 4: Quality Rating
- **Name:** `quality_tier`
- **Label:** Quality Tier
- **Type:** select
- **Options:** Premium, Standard, Economy
- **Use:** Classify product quality levels

---

## ⚠️ Important Rules

✅ **DO:**
- Use descriptive labels (what users see)
- Use lowercase names with underscores (internals)
- Mark fields as required if mandatory
- Add descriptions for clarity

❌ **DON'T:**
- Use same name twice (will be rejected)
- Use spaces or special chars in internal name
- Delete fields if they contain data (they'll be soft-deleted)
- Add too many fields (keep performance in mind)

---

## 🔄 Workflow for Team

### Superuser: Setup Phase
1. Identify all needed custom fields from team
2. Create fields in Manage Columns
3. Share the new form structure with team

### Sales/R&D: Data Entry Phase
1. Open Enquiry Form
2. Fill in both standard and custom fields
3. Save enquiry
4. Custom data is stored automatically

### All Users: Reporting Phase
1. View custom columns in DataGrid
2. Filter and sort by custom fields
3. Export to Excel (includes custom columns)
4. Generate reports with custom data

---

## 🧪 Testing Your Setup

After creating a custom field:

**Test 1: Form Input**
```
✓ Field appears in EnquiryForm
✓ Can enter value
✓ Value saves with enquiry
```

**Test 2: DataGrid Display**
```
✓ Column appears in EnquiryList
✓ Value displays in rows
✓ Can sort/filter by column
```

**Test 3: Excel Export**
```
✓ Column appears in Excel file
✓ Data exports correctly
✓ File downloads without error
```

**Test 4: Excel Import**
```
✓ Excel with same columns imports
✓ Custom values stored in dynamicFields
✓ Values appear in DataGrid after import
```

---

## 📊 Database Structure (For Developers)

### CustomField Collection
```json
{
  "_id": ObjectId,
  "name": "customer_budget",
  "label": "Customer Budget",
  "type": "number",
  "isRequired": true,
  "description": "Total budget allocated",
  "createdBy": ObjectId,
  "isActive": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### Enquiry Document (dynamicFields)
```json
{
  "_id": ObjectId,
  "enquiryNumber": "ENQ-202602-0001",
  ... static fields ...,
  "dynamicFields": {
    "customer_budget": 50000,
    "is_priority": true,
    "required_delivery_date": "2026-03-15"
  }
}
```

---

## 🔗 Related Pages

| Page | Function |
|------|----------|
| **Settings → Manage Columns** | Create/delete custom fields |
| **Enquiries → Create/Edit** | Fill custom field values |
| **Enquiries → List** | View all custom columns |
| **Reports → Export Excel** | Download with custom fields |
| **Bulk Import** | Auto-detect custom columns |

---

## 💡 Tips & Tricks

**Tip 1: Name Consistency**
- Use consistent naming: `customer_*`, `product_*`, `team_*`
- Makes it easy to find related fields

**Tip 2: Soft Deletion**
- Deleting a field doesn't remove the data
- Old enquiries keep the values
- New enquiries won't have the field

**Tip 3: Excel Import Magic**
- Upload Excel with unknown columns
- Superuser automatically creates fields
- Perfect for bulk migrations

**Tip 4: Performance**
- Too many columns may slow DataGrid
- Consider: 5-10 custom fields is ideal
- Can always add more later

---

## ❓ FAQ

**Q: Can I edit a field's name after creating it?**
A: No, name is locked (use for internal identification). You can update the label.

**Q: What happens to data when I delete a field?**
A: Field is soft-deleted. Old enquiries keep values, new ones won't show it.

**Q: Can non-superusers create custom fields?**
A: No, only superuser can create/modify/delete fields.

**Q: Do custom fields work with Excel import?**
A: Yes! Superuser can import Excel with custom columns - they'll auto-create.

**Q: How many custom fields can I add?**
A: Unlimited technically, but keep < 20 for performance reasons.

**Q: Will custom fields break existing enquiries?**
A: No, existing enquiries work unchanged. Backward compatible.

---

## 🚨 Troubleshooting

**Problem: Custom field not showing in form**
- Solution: Refresh page (fields load on component mount)

**Problem: Duplicate name error**
- Solution: Each field name must be unique, choose different name

**Problem: Can't see Manage Columns option**
- Solution: Ensure you're logged in as superuser

**Problem: DataGrid not showing new column**
- Solution: Check that field is marked as isActive=true in database

**Problem: Excel export empty for custom field**
- Solution: Verify enquiry has value in dynamicFields for that field

---

## 📞 Support

For issues or questions:
1. Check the DYNAMIC_COLUMNS_IMPLEMENTATION.md file
2. Review backend logs for API errors
3. Check browser console for frontend errors
4. Verify superuser role is correctly assigned

---

**Last Updated:** February 12, 2026
**Status:** Ready for Production ✅
