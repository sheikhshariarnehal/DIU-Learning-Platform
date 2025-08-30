# Database Migration Guide - Adding Description Column

## 🚨 **Issue**: Syllabus Description Not Saving

The syllabus description field is not being saved because the `description` column is missing from the `study_tools` table in your database.

---

## 🔧 **Solution**: Add Description Column

### **Option 1: Using Database Management Tool (Recommended)**

If you're using **pgAdmin**, **DBeaver**, or similar database management tool:

1. **Connect to your database**
2. **Navigate to the `study_tools` table**
3. **Run this SQL command**:

```sql
ALTER TABLE study_tools ADD COLUMN description TEXT;
```

### **Option 2: Using Command Line (psql)**

If you have PostgreSQL command line access:

```bash
psql -h localhost -U postgres -d learning_platform -c "ALTER TABLE study_tools ADD COLUMN description TEXT;"
```

### **Option 3: Using Supabase Dashboard**

If you're using Supabase:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this query**:

```sql
ALTER TABLE study_tools ADD COLUMN description TEXT;
```

---

## 🧪 **Verify the Fix**

After running the migration, test it:

1. **Visit**: `http://localhost:3003/test-db`
2. **Click "Test Again"** to verify the column exists
3. **Try creating a syllabus** in the admin panel

---

## 📋 **Complete Migration Script**

For a complete setup, run this comprehensive migration:

```sql
-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='study_tools' AND column_name='description') THEN
        ALTER TABLE study_tools ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to study_tools table';
    ELSE
        RAISE NOTICE 'Description column already exists';
    END IF;
END $$;

-- Update content_url constraint to allow NULL values (for syllabus)
ALTER TABLE study_tools DROP CONSTRAINT IF EXISTS valid_content_url;
ALTER TABLE study_tools ADD CONSTRAINT valid_content_url 
    CHECK (content_url IS NULL OR content_url ~* '^https?://.*');

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'study_tools' 
ORDER BY ordinal_position;
```

---

## 🎯 **Expected Result**

After the migration, your `study_tools` table should have these columns:

| Column Name | Data Type | Nullable | Description |
|-------------|-----------|----------|-------------|
| id | UUID | NO | Primary key |
| title | VARCHAR(255) | NO | Study tool title |
| **description** | **TEXT** | **YES** | **Syllabus content** |
| type | VARCHAR(50) | NO | Tool type (syllabus, etc.) |
| content_url | TEXT | YES | File URL (NULL for syllabus) |
| course_id | UUID | NO | Foreign key to courses |
| exam_type | VARCHAR(20) | YES | Exam type |
| created_at | TIMESTAMP | YES | Creation timestamp |
| updated_at | TIMESTAMP | YES | Update timestamp |

---

## ✅ **Test Syllabus Functionality**

Once the column is added:

1. **Go to Admin → Semester Management**
2. **Add a new study tool**
3. **Select "Syllabus" type**
4. **Fill in the description field** with content like:

```
# Course Overview
This course covers fundamental concepts of web development.

## Learning Objectives
- Understand HTML, CSS, and JavaScript
- Build responsive web applications
- Learn modern frameworks and tools

## Assessment
- Midterm Exam: 30%
- Final Exam: 40%
- Assignments: 30%
```

5. **Save and test** - the syllabus should display beautifully in the content viewer

---

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the test page**: `http://localhost:3003/test-db`
2. **Verify database connection** in your `.env` file
3. **Check browser console** for any JavaScript errors
4. **Restart the development server** after database changes

---

## 📞 **Need Help?**

If you need assistance with the database migration:

1. **Share your database setup** (PostgreSQL, Supabase, etc.)
2. **Run the test page** and share the results
3. **Check if you have database admin access**

The syllabus feature will work perfectly once the `description` column is added! 🎉
