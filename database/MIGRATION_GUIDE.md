# Supabase Migration Guide - DIU Learning Platform

## 🚀 **Complete Database Schema for Enhanced All-in-One Creator**

### 📁 **Files Overview**

1. **`supabase-migration-schema.sql`** - Complete database schema
2. **`supabase-rls-policies.sql`** - Security policies (RLS)
3. **`backup-restore-scripts.sql`** - Backup and maintenance utilities
4. **`MIGRATION_GUIDE.md`** - This guide

---

## 🎯 **Migration Steps**

### **Step 1: Prepare Supabase Project**

#### **1.1 Create New Supabase Project**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it securely)
5. Wait for project creation

#### **1.2 Get Connection Details**
1. Go to Project Settings → Database
2. Copy connection string and API keys
3. Note down:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJ...` (for frontend)
   - **Service Role Key**: `eyJ...` (for backend)

### **Step 2: Run Database Schema**

#### **2.1 Execute Main Schema**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-migration-schema.sql`
3. Paste and click "Run"
4. Verify success messages appear

#### **2.2 Configure Security (Choose One)**

**For Development:**
```sql
-- Use the development section in supabase-rls-policies.sql
-- This disables RLS for easier development
```

**For Production:**
```sql
-- Uncomment the production section in supabase-rls-policies.sql
-- This enables proper security policies
```

#### **2.3 Add Backup Functions**
1. Copy contents of `backup-restore-scripts.sql`
2. Paste in SQL Editor and run
3. Backup and maintenance functions will be available

### **Step 3: Configure Application**

#### **3.1 Update Environment Variables**
Create/update `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (for direct connections if needed)
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

#### **3.2 Test Connection**
1. Start your application: `npm run dev`
2. Go to: `http://localhost:3000/api/admin/enhanced-creator/test`
3. Should return: `{"success": true, "message": "Database connection successful"}`

### **Step 4: Verify Migration**

#### **4.1 Test Enhanced Creator**
1. **Create**: `http://localhost:3000/admin/enhanced-creator`
2. **List**: `http://localhost:3000/admin/enhanced-creator/list`
3. **Database Test**: `http://localhost:3000/admin/test-db`

#### **4.2 Check Database Tables**
In Supabase Dashboard → Table Editor, verify:
- ✅ `semesters` table exists
- ✅ `courses` table exists
- ✅ `topics` table exists
- ✅ `slides` table exists
- ✅ `videos` table exists
- ✅ `study_tools` table exists
- ✅ `admin_users` table exists
- ✅ All relationships working

---

## 📊 **Database Schema Details**

### **Core Tables**

#### **1. Semesters**
```sql
- id (UUID, Primary Key)
- title (Text, Required)
- description (Text, Optional)
- section (Text, Required)
- has_midterm (Boolean, Default: true)
- has_final (Boolean, Default: true)
- start_date (Date, Optional)
- end_date (Date, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **2. Courses**
```sql
- id (UUID, Primary Key)
- title (Text, Required)
- course_code (Text, Required)
- teacher_name (Text, Required)
- teacher_email (Text, Optional)
- credits (Integer, Default: 3)
- description (Text, Optional)
- semester_id (UUID, Foreign Key → semesters.id)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **3. Topics**
```sql
- id (UUID, Primary Key)
- title (Text, Required)
- description (Text, Optional)
- course_id (UUID, Foreign Key → courses.id)
- order_index (Integer, Default: 0)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **4. Slides**
```sql
- id (UUID, Primary Key)
- title (Text, Required)
- google_drive_url (Text, Required)
- description (Text, Optional)
- topic_id (UUID, Foreign Key → topics.id)
- order_index (Integer, Default: 0)
- file_size (Text, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **5. Videos**
```sql
- id (UUID, Primary Key)
- title (Text, Required)
- youtube_url (Text, Required)
- description (Text, Optional)
- duration (Text, Optional)
- topic_id (UUID, Foreign Key → topics.id)
- order_index (Integer, Default: 0)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **6. Study Tools**
```sql
- id (UUID, Primary Key)
- title (Text, Required)
- type (Text, Required) - PDF, DOC, PPT, etc.
- content_url (Text, Required)
- description (Text, Optional)
- exam_type (Text, Required) - midterm, final, etc.
- file_size (Text, Optional)
- course_id (UUID, Foreign Key → courses.id)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### **Admin & Analytics Tables**

#### **7. Admin Users**
```sql
- id (UUID, Primary Key)
- email (Text, Unique, Required)
- password_hash (Text, Required)
- name (Text, Required)
- role (Text, Default: 'admin')
- is_active (Boolean, Default: true)
- last_login (Timestamp, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### **8. Admin Sessions**
```sql
- id (UUID, Primary Key)
- admin_user_id (UUID, Foreign Key → admin_users.id)
- session_token (Text, Unique, Required)
- expires_at (Timestamp, Required)
- ip_address (INET, Optional)
- user_agent (Text, Optional)
- created_at (Timestamp)
```

#### **9. Content Analytics**
```sql
- id (UUID, Primary Key)
- content_type (Text, Required) - slide, video, study_tool
- content_id (UUID, Required)
- action_type (Text, Required) - view, download, share
- user_ip (INET, Optional)
- user_agent (Text, Optional)
- metadata (JSONB, Optional)
- created_at (Timestamp)
```

#### **10. System Logs**
```sql
- id (UUID, Primary Key)
- level (Text, Required) - info, warning, error, debug
- message (Text, Required)
- context (JSONB, Optional)
- admin_user_id (UUID, Optional, Foreign Key → admin_users.id)
- ip_address (INET, Optional)
- created_at (Timestamp)
```

---

## 🔧 **Maintenance & Backup**

### **Regular Maintenance**
```sql
-- Update statistics (run weekly)
SELECT update_table_statistics();

-- Vacuum tables (run monthly)
SELECT vacuum_tables();

-- Cleanup old data (run monthly)
SELECT cleanup_old_analytics();
SELECT cleanup_old_logs();
SELECT cleanup_expired_sessions();
```

### **Backup Operations**
```sql
-- Create backup
SELECT create_full_backup('backup_' || to_char(now(), 'YYYYMMDD_HH24MISS'));

-- List backups
SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'backup_%';

-- Restore from backup
SELECT restore_from_backup('backup_20250122_120000');

-- Export specific semester
SELECT export_semester_data('your-semester-uuid');
```

---

## 🚀 **Production Deployment**

### **Security Checklist**
- ✅ Enable RLS policies (production mode)
- ✅ Use service role key for backend operations
- ✅ Configure proper CORS settings
- ✅ Set up SSL/TLS certificates
- ✅ Configure database backups
- ✅ Set up monitoring and alerts

### **Performance Optimization**
- ✅ All necessary indexes created
- ✅ Query optimization applied
- ✅ Connection pooling configured
- ✅ Regular maintenance scheduled

### **Monitoring**
- ✅ Database performance metrics
- ✅ Query execution times
- ✅ Storage usage tracking
- ✅ Error rate monitoring

---

## 🎉 **Migration Complete!**

Your Enhanced All-in-One Creator database is now ready for production use with:

- ✅ **Complete Schema**: All tables, relationships, and constraints
- ✅ **Security**: RLS policies for production deployment
- ✅ **Performance**: Optimized indexes and queries
- ✅ **Maintenance**: Backup and cleanup utilities
- ✅ **Analytics**: Usage tracking and system logging
- ✅ **Scalability**: Designed for growth and expansion

**Next Steps**: Test all functionality and deploy to production! 🚀
