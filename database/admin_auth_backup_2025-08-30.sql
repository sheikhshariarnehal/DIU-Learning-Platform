-- ============================================================================
-- ADMIN AUTHENTICATION DATABASE BACKUP
-- Generated: 2025-08-30
-- Description: Complete backup of admin authentication system including
--              schema, constraints, indexes, RLS policies, and sample data
-- ============================================================================

-- ============================================================================
-- 1. ADMIN USERS TABLE SCHEMA
-- ============================================================================

-- Drop existing table if recreating
-- DROP TABLE IF EXISTS public.admin_users CASCADE;

CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying,
    department character varying(100),
    phone character varying(20),
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    login_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- 2. ADMIN SESSIONS TABLE SCHEMA
-- ============================================================================

-- Drop existing table if recreating
-- DROP TABLE IF EXISTS public.admin_sessions CASCADE;

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    session_token character varying NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. CONSTRAINTS AND RELATIONSHIPS
-- ============================================================================

-- Admin Users Constraints
ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT valid_email CHECK ((email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text));

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_role_check CHECK (((role)::text = ANY (ARRAY[('super_admin'::character varying)::text, ('admin'::character varying)::text, ('moderator'::character varying)::text, ('content_creator'::character varying)::text])));

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT positive_login_count CHECK ((login_count >= 0));

-- Admin Sessions Constraints
ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_session_token_key UNIQUE (session_token);

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_expires_check CHECK ((expires_at > created_at));

-- Foreign Key Relationships
ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Admin Users Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users USING btree (is_active);

-- Admin Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON public.admin_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions USING btree (session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON public.admin_sessions USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_created_at ON public.admin_sessions USING btree (created_at);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role full access admin_sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admin users can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can manage own sessions" ON public.admin_sessions;

-- Admin Users Policies
CREATE POLICY "Service role full access admin_users" ON public.admin_users
    FOR ALL USING (current_setting('role'::text) = 'service_role'::text);

CREATE POLICY "Admin users can read admin_users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admin users can update own profile" ON public.admin_users
    FOR UPDATE USING (id = auth.uid());

-- Admin Sessions Policies
CREATE POLICY "Service role full access admin_sessions" ON public.admin_sessions
    FOR ALL USING (current_setting('role'::text) = 'service_role'::text);

CREATE POLICY "Admin users can manage own sessions" ON public.admin_sessions
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- 6. SAMPLE DATA (Current Admin Users - Passwords Excluded for Security)
-- ============================================================================

-- Note: Password hashes are excluded from this backup for security reasons
-- Default admin user structure (password needs to be set separately):
/*
INSERT INTO public.admin_users (
    id, email, full_name, role, department, phone, is_active, 
    last_login, login_count, created_at, updated_at
) VALUES (
    'e2978258-5531-496e-a512-4534f041effd',
    'admin@diu.edu.bd',
    'System Administrator',
    'admin',
    'IT Department',
    '+880-1234-567890',
    true,
    '2025-08-30 11:08:03.974+00',
    16,
    '2025-08-30 08:44:04.240723+00',
    '2025-08-30 11:08:03.974+00'
);
*/

-- ============================================================================
-- 7. FUNCTIONS AND TRIGGERS (Auto-update timestamps)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for admin_users table
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF ADMIN AUTHENTICATION BACKUP
-- ============================================================================
