# Section Admin Testing Guide

This guide provides comprehensive testing instructions for the Section Admin Dashboard functionality.

## 🧪 Pre-Testing Setup

### 1. Database Setup
Run the migration script to add section_admin role:
```sql
\i database/migrations/add_section_admin_role.sql
```

### 2. Test User Creation
The migration script creates a test user:
- **Email**: `sectionadmin@diu.edu.bd`
- **Password**: `sectionadmin123`
- **Role**: `section_admin`
- **Department**: `CS-A`

### 3. Environment Check
Ensure all environment variables are set:
- `JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🔐 Authentication Testing

### Test 1: Section Admin Login
1. Navigate to `/login`
2. Enter credentials: `sectionadmin@diu.edu.bd` / `sectionadmin123`
3. **Expected**: Successful login and redirect to `/section-admin`
4. **Verify**: User role badge shows "Section Admin"

### Test 2: Access Control
1. Try accessing `/admin` with section admin credentials
2. **Expected**: Access denied or redirect to appropriate dashboard
3. Try accessing `/section-admin` without login
4. **Expected**: Redirect to login page

### Test 3: Role-Based Navigation
1. Login as section admin
2. Check sidebar navigation items
3. **Expected**: Section admin specific menu items visible
4. **Verify**: No admin-only features accessible

## 🎛️ Dashboard Testing

### Test 4: Dashboard Load
1. Navigate to `/section-admin`
2. **Expected**: Dashboard loads with statistics
3. **Verify**: 
   - Statistics cards display data
   - Recent activity shows
   - Quick action buttons work

### Test 5: Statistics Accuracy
1. Check dashboard statistics
2. **Expected**: Numbers match actual data in database
3. **Verify**: 
   - Active semesters count
   - Total courses count
   - Materials count
   - Engagement metrics

## 📚 Semester Management Testing

### Test 6: Enhanced Semester Management Access
1. Click "Enhanced Semester Management" from dashboard
2. Navigate to `/section-admin/semester-management`
3. **Expected**: Enhanced interface loads
4. **Verify**:
   - Professional UI design
   - Tab navigation works
   - Search and filter options available

### Test 7: Semester List View
1. Go to "Manage Semesters" tab
2. **Expected**: List of semesters displays
3. **Verify**:
   - Search functionality works
   - Filter by section works
   - Sort options function
   - Action buttons are present

### Test 8: Semester Creation
1. Go to "Create New" tab
2. Fill in semester details:
   - Title: "Test Semester Spring 2024"
   - Description: "Test semester for validation"
   - Section: "CS-A" (or user's department)
   - Enable midterm and final exams
3. **Expected**: Form validation works
4. **Verify**:
   - Required field validation
   - Section restriction for section admin
   - Success message on creation

### Test 9: Semester Search and Filter
1. In semester list, use search box
2. Search for existing semester
3. **Expected**: Results filter correctly
4. Test section filter
5. **Expected**: Only user's section semesters show

## 🔒 Security Testing

### Test 10: API Authorization
1. Test API endpoints without authentication:
   ```bash
   curl -X GET http://localhost:3000/api/section-admin/semesters
   ```
2. **Expected**: 401 Unauthorized response

### Test 11: Cross-Section Access
1. Create semester with different section than user's department
2. **Expected**: Access denied error
3. Try to access another section's semester
4. **Expected**: 403 Forbidden or 404 Not Found

### Test 12: Token Validation
1. Login and get valid token
2. Manually expire or modify token
3. Try accessing section admin routes
4. **Expected**: Redirect to login page

## 📱 UI/UX Testing

### Test 13: Responsive Design
1. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. **Expected**: Layout adapts properly
3. **Verify**:
   - Sidebar collapses on mobile
   - Tables are scrollable
   - Buttons remain accessible

### Test 14: Theme Support
1. Toggle between light and dark themes
2. **Expected**: All components adapt correctly
3. **Verify**:
   - Colors change appropriately
   - Text remains readable
   - Icons and badges update

### Test 15: Loading States
1. Navigate between pages
2. **Expected**: Loading indicators show
3. **Verify**:
   - Skeleton loaders for lists
   - Spinner for API calls
   - Disabled states during operations

## 🚀 Performance Testing

### Test 16: Page Load Speed
1. Measure initial page load time
2. **Expected**: < 3 seconds on average connection
3. **Verify**:
   - Dashboard loads quickly
   - Semester list renders efficiently
   - No unnecessary API calls

### Test 17: Large Dataset Handling
1. Create multiple semesters (10+)
2. Test search and filter performance
3. **Expected**: Smooth operation with large datasets
4. **Verify**:
   - Search results appear quickly
   - Pagination works if implemented
   - No browser freezing

## 🔄 API Testing

### Test 18: Semester CRUD Operations
Test all API endpoints:

```bash
# Get semesters (with auth token)
curl -X GET http://localhost:3000/api/section-admin/semesters \
  -H "Cookie: admin_token=YOUR_TOKEN"

# Create semester
curl -X POST http://localhost:3000/api/section-admin/semesters \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=YOUR_TOKEN" \
  -d '{"semester":{"title":"Test","section":"CS-A","description":"Test"}}'

# Update semester
curl -X PUT http://localhost:3000/api/section-admin/semesters/SEMESTER_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=YOUR_TOKEN" \
  -d '{"semester":{"title":"Updated Test","section":"CS-A"}}'

# Delete semester
curl -X DELETE http://localhost:3000/api/section-admin/semesters/SEMESTER_ID \
  -H "Cookie: admin_token=YOUR_TOKEN"
```

### Test 19: Statistics API
```bash
curl -X GET http://localhost:3000/api/section-admin/stats \
  -H "Cookie: admin_token=YOUR_TOKEN"
```
**Expected**: Returns section-specific statistics

## 🐛 Error Handling Testing

### Test 20: Network Errors
1. Disconnect internet during operation
2. **Expected**: Appropriate error messages
3. **Verify**:
   - User-friendly error messages
   - Retry mechanisms work
   - No data corruption

### Test 21: Invalid Data Handling
1. Submit forms with invalid data
2. **Expected**: Validation errors show
3. **Verify**:
   - Required field messages
   - Format validation
   - Server-side validation

## ✅ Test Results Checklist

Mark each test as completed:

- [ ] Test 1: Section Admin Login
- [ ] Test 2: Access Control
- [ ] Test 3: Role-Based Navigation
- [ ] Test 4: Dashboard Load
- [ ] Test 5: Statistics Accuracy
- [ ] Test 6: Enhanced Semester Management Access
- [ ] Test 7: Semester List View
- [ ] Test 8: Semester Creation
- [ ] Test 9: Semester Search and Filter
- [ ] Test 10: API Authorization
- [ ] Test 11: Cross-Section Access
- [ ] Test 12: Token Validation
- [ ] Test 13: Responsive Design
- [ ] Test 14: Theme Support
- [ ] Test 15: Loading States
- [ ] Test 16: Page Load Speed
- [ ] Test 17: Large Dataset Handling
- [ ] Test 18: Semester CRUD Operations
- [ ] Test 19: Statistics API
- [ ] Test 20: Network Errors
- [ ] Test 21: Invalid Data Handling

## 🚨 Known Issues & Limitations

### Current Limitations
1. **Create/Edit Forms**: Full implementation pending in enhanced semester management
2. **Real-time Updates**: WebSocket integration not yet implemented
3. **Bulk Operations**: Some bulk operations are UI-only
4. **Advanced Analytics**: More detailed reporting features planned

### Workarounds
1. Use existing admin semester management for full CRUD operations
2. Refresh page for latest data
3. Individual operations for now
4. Basic statistics available

## 📋 Bug Report Template

If you find issues during testing:

```
**Bug Title**: Brief description
**Test Case**: Which test revealed the issue
**Steps to Reproduce**: 
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Environment**: Browser, OS, screen size
**Severity**: Critical/High/Medium/Low
**Screenshots**: If applicable
```

## 🎯 Success Criteria

The Section Admin Dashboard is considered ready when:

- [ ] All authentication tests pass
- [ ] Dashboard loads and displays correct data
- [ ] Semester management interface is functional
- [ ] Security measures are effective
- [ ] UI is responsive and professional
- [ ] API endpoints work correctly
- [ ] Error handling is robust
- [ ] Performance is acceptable

---

**Testing Completed By**: _______________  
**Date**: _______________  
**Overall Status**: ⭕ Pass / ❌ Fail  
**Notes**: _______________
