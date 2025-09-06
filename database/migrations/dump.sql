

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."approve_admin_user"("user_id" "uuid", "approved_by_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.admin_profiles 
    SET 
        is_approved = true,
        approval_status = 'approved',
        approved_by = approved_by_id,
        approved_at = now(),
        updated_at = now()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."approve_admin_user"("user_id" "uuid", "approved_by_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_admin_sessions"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.admin_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_admin_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_sessions"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_stats"() RETURNS TABLE("total_admins" integer, "approved_admins" integer, "pending_approval" integer, "rejected_admins" integer, "super_admins" integer, "regular_admins" integer, "moderators" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::integer as total_admins,
        COUNT(*) FILTER (WHERE is_approved = true)::integer as approved_admins,
        COUNT(*) FILTER (WHERE approval_status = 'pending')::integer as pending_approval,
        COUNT(*) FILTER (WHERE approval_status = 'rejected')::integer as rejected_admins,
        COUNT(*) FILTER (WHERE role = 'super_admin')::integer as super_admins,
        COUNT(*) FILTER (WHERE role = 'admin')::integer as regular_admins,
        COUNT(*) FILTER (WHERE role = 'moderator')::integer as moderators
    FROM public.admin_profiles;
END;
$$;


ALTER FUNCTION "public"."get_admin_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_user_profile"("user_email" "text") RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "role" "text", "department" "text", "phone" "text", "is_approved" boolean, "approval_status" "text", "last_login" timestamp with time zone, "login_count" integer, "email_confirmed_at" timestamp with time zone, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.id,
        ap.email,
        ap.full_name,
        ap.role,
        ap.department,
        ap.phone,
        ap.is_approved,
        ap.approval_status,
        ap.last_login,
        ap.login_count,
        au.email_confirmed_at,
        ap.created_at
    FROM public.admin_profiles ap
    JOIN auth.users au ON ap.id = au.id
    WHERE ap.email = user_email;
END;
$$;


ALTER FUNCTION "public"."get_admin_user_profile"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_user_stats"() RETURNS TABLE("total_users" integer, "active_users" integer, "pending_approval" integer, "super_admins" integer, "admins" integer, "moderators" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_users,
        COUNT(*) FILTER (WHERE is_active = true AND is_approved = true)::INTEGER as active_users,
        COUNT(*) FILTER (WHERE is_approved = false)::INTEGER as pending_approval,
        COUNT(*) FILTER (WHERE role = 'super_admin')::INTEGER as super_admins,
        COUNT(*) FILTER (WHERE role = 'admin')::INTEGER as admins,
        COUNT(*) FILTER (WHERE role = 'moderator')::INTEGER as moderators
    FROM public.admin_users;
END;
$$;


ALTER FUNCTION "public"."get_admin_user_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_semester_stats"("semester_uuid" "uuid") RETURNS TABLE("total_courses" integer, "total_topics" integer, "total_slides" integer, "total_videos" integer, "total_study_tools" integer, "total_duration_minutes" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT c.id)::INTEGER as total_courses,
        COUNT(DISTINCT t.id)::INTEGER as total_topics,
        COUNT(DISTINCT sl.id)::INTEGER as total_slides,
        COUNT(DISTINCT v.id)::INTEGER as total_videos,
        COUNT(DISTINCT st.id)::INTEGER as total_study_tools,
        COALESCE(SUM(v.duration_minutes), 0)::INTEGER as total_duration_minutes
    FROM semesters s
    LEFT JOIN courses c ON s.id = c.semester_id AND c.is_active = true
    LEFT JOIN topics t ON c.id = t.course_id AND t.is_published = true
    LEFT JOIN slides sl ON t.id = sl.topic_id
    LEFT JOIN videos v ON t.id = v.topic_id AND v.is_published = true
    LEFT JOIN study_tools st ON c.id = st.course_id
    WHERE s.id = semester_uuid;
END;
$$;


ALTER FUNCTION "public"."get_semester_stats"("semester_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_admin_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only create admin profile if user has admin metadata
    IF NEW.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'moderator') THEN
        INSERT INTO public.admin_profiles (
            id,
            email,
            full_name,
            role,
            department,
            phone,
            is_approved,
            approval_status
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
            NEW.raw_user_meta_data->>'department',
            NEW.raw_user_meta_data->>'phone',
            CASE WHEN NEW.raw_user_meta_data->>'role' = 'super_admin' THEN true ELSE false END,
            CASE WHEN NEW.raw_user_meta_data->>'role' = 'super_admin' THEN 'approved' ELSE 'pending' END
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.admin_profiles (
    id,
    email,
    full_name,
    role,
    department,
    phone,
    is_approved,
    approval_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    true,  -- Auto-approve
    'approved'  -- Auto-approve status
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_system_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO system_logs (action, entity_type, entity_id, old_values, new_values)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."log_system_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_login_stats"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.admin_profiles 
    SET 
        last_login = now(),
        login_count = login_count + 1,
        updated_at = now()
    WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."update_admin_login_stats"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_admin_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_users_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_admin_users_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_token" character varying NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "expires_at" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_sessions_expires_check" CHECK (("expires_at" > "created_at"))
);


ALTER TABLE "public"."admin_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "role" character varying(50) DEFAULT 'admin'::character varying,
    "department" character varying(100),
    "phone" character varying(20),
    "is_active" boolean DEFAULT true,
    "last_login" timestamp with time zone,
    "login_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_users_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['super_admin'::character varying, 'admin'::character varying, 'moderator'::character varying, 'content_creator'::character varying, 'section_admin'::character varying])::"text"[]))),
    CONSTRAINT "positive_login_count" CHECK (("login_count" >= 0)),
    CONSTRAINT "valid_email" CHECK ((("email")::"text" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."admin_users"."role" IS 'User role: super_admin, admin, moderator, content_creator, or section_admin';



CREATE TABLE IF NOT EXISTS "public"."admin_users_backup" (
    "id" "uuid",
    "email" character varying(255),
    "password_hash" character varying(255),
    "full_name" character varying(255),
    "role" character varying(50),
    "department" character varying(100),
    "phone" character varying(20),
    "is_active" boolean,
    "last_login" timestamp with time zone,
    "login_count" integer,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."admin_users_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users_backup_auth" (
    "id" "uuid",
    "email" character varying,
    "password_hash" character varying,
    "full_name" character varying,
    "role" character varying,
    "department" character varying,
    "phone" character varying,
    "is_active" boolean,
    "is_approved" boolean,
    "last_login" timestamp with time zone,
    "login_count" integer,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."admin_users_backup_auth" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_type" character varying(20) NOT NULL,
    "content_id" "uuid" NOT NULL,
    "action_type" character varying(20) NOT NULL,
    "user_ip" "inet",
    "user_agent" "text",
    "session_id" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "content_analytics_action_type_check" CHECK ((("action_type")::"text" = ANY ((ARRAY['view'::character varying, 'download'::character varying, 'share'::character varying])::"text"[]))),
    CONSTRAINT "content_analytics_content_type_check" CHECK ((("content_type")::"text" = ANY ((ARRAY['slide'::character varying, 'video'::character varying, 'study_tool'::character varying])::"text"[])))
);


ALTER TABLE "public"."content_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "course_code" character varying(50) NOT NULL,
    "teacher_name" character varying(255) NOT NULL,
    "teacher_email" character varying(255),
    "description" "text",
    "credits" integer DEFAULT 3,
    "semester_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_highlighted" boolean DEFAULT false,
    CONSTRAINT "courses_credits_check" CHECK ((("credits" >= 1) AND ("credits" <= 6))),
    CONSTRAINT "valid_teacher_email" CHECK ((("teacher_email" IS NULL) OR (("teacher_email")::"text" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."courses"."is_highlighted" IS 'Indicates if the course should be highlighted/featured in the user interface';



CREATE TABLE IF NOT EXISTS "public"."semesters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "section" character varying(50) NOT NULL,
    "has_midterm" boolean DEFAULT true,
    "has_final" boolean DEFAULT true,
    "start_date" "date",
    "end_date" "date",
    "default_credits" integer DEFAULT 3,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "semesters_default_credits_check" CHECK ((("default_credits" >= 1) AND ("default_credits" <= 6))),
    CONSTRAINT "valid_date_range" CHECK ((("start_date" IS NULL) OR ("end_date" IS NULL) OR ("start_date" < "end_date")))
);


ALTER TABLE "public"."semesters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "google_drive_url" "text" NOT NULL,
    "topic_id" "uuid",
    "order_index" integer DEFAULT 0,
    "file_size_mb" numeric(10,2),
    "slide_count" integer,
    "is_downloadable" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_file_size" CHECK ((("file_size_mb" IS NULL) OR ("file_size_mb" > (0)::numeric))),
    CONSTRAINT "positive_order_index" CHECK (("order_index" >= 0)),
    CONSTRAINT "positive_slide_count" CHECK ((("slide_count" IS NULL) OR ("slide_count" > 0))),
    CONSTRAINT "valid_google_url" CHECK (("google_drive_url" ~* '^https://(drive|docs|sheets|forms|sites|calendar|meet|classroom|photos|maps|translate|scholar|books|news|mail|youtube|blogger|plus|hangouts|keep|jamboard|earth|chrome|play|store|pay|ads|analytics|search|trends|alerts|groups|contacts|voice|duo|allo|spaces|currents|my|accounts|support|developers|cloud|firebase|colab|datastudio|optimize|tagmanager|marketingplatform|admob|adsense|doubleclick|googleadservices|googlesyndication|googletagmanager|googleusercontent|gstatic|googleapis|appspot|firebaseapp|web\.app|page\.link|goo\.gl|g\.co)\.google\.com/.*'::"text"))
);


ALTER TABLE "public"."slides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."study_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "type" character varying(50) NOT NULL,
    "content_url" "text",
    "course_id" "uuid",
    "exam_type" character varying(20) DEFAULT 'both'::character varying,
    "file_size_mb" numeric(10,2),
    "file_format" character varying(10),
    "academic_year" character varying(20),
    "is_downloadable" boolean DEFAULT true,
    "download_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_download_count" CHECK (("download_count" >= 0)),
    CONSTRAINT "positive_file_size" CHECK ((("file_size_mb" IS NULL) OR ("file_size_mb" > (0)::numeric))),
    CONSTRAINT "study_tools_exam_type_check" CHECK ((("exam_type")::"text" = ANY ((ARRAY['midterm'::character varying, 'final'::character varying, 'both'::character varying, 'assignment'::character varying, 'quiz'::character varying])::"text"[]))),
    CONSTRAINT "study_tools_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['previous_questions'::character varying, 'exam_note'::character varying, 'syllabus'::character varying, 'mark_distribution'::character varying, 'assignment'::character varying, 'lab_manual'::character varying, 'reference_book'::character varying])::"text"[]))),
    CONSTRAINT "valid_content_url" CHECK ((("content_url" IS NULL) OR ("content_url" ~* '^https?://.*'::"text")))
);


ALTER TABLE "public"."study_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" character varying(100) NOT NULL,
    "entity_type" character varying(50),
    "entity_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "course_id" "uuid",
    "order_index" integer DEFAULT 0,
    "estimated_duration_minutes" integer,
    "difficulty_level" character varying(20),
    "is_published" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_duration" CHECK ((("estimated_duration_minutes" IS NULL) OR ("estimated_duration_minutes" > 0))),
    CONSTRAINT "positive_order_index" CHECK (("order_index" >= 0)),
    CONSTRAINT "topics_difficulty_level_check" CHECK ((("difficulty_level")::"text" = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::"text"[])))
);


ALTER TABLE "public"."topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "youtube_url" "text" NOT NULL,
    "topic_id" "uuid",
    "order_index" integer DEFAULT 0,
    "duration_minutes" integer,
    "video_quality" character varying(10),
    "has_subtitles" boolean DEFAULT false,
    "language" character varying(10) DEFAULT 'en'::character varying,
    "is_published" boolean DEFAULT true,
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_duration" CHECK ((("duration_minutes" IS NULL) OR ("duration_minutes" > 0))),
    CONSTRAINT "positive_order_index" CHECK (("order_index" >= 0)),
    CONSTRAINT "positive_view_count" CHECK (("view_count" >= 0)),
    CONSTRAINT "valid_youtube_url" CHECK (("youtube_url" ~* '^https://(www\.)?youtube\.com/watch\?v=.*|^https://youtu\.be/.*'::"text")),
    CONSTRAINT "videos_video_quality_check" CHECK ((("video_quality")::"text" = ANY ((ARRAY['720p'::character varying, '1080p'::character varying, '4K'::character varying])::"text"[])))
);


ALTER TABLE "public"."videos" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_analytics"
    ADD CONSTRAINT "content_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."semesters"
    ADD CONSTRAINT "semesters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."slides"
    ADD CONSTRAINT "slides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_tools"
    ADD CONSTRAINT "study_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "unique_course_code_semester" UNIQUE ("course_code", "semester_id");



ALTER TABLE ONLY "public"."semesters"
    ADD CONSTRAINT "unique_semester_section" UNIQUE ("title", "section");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admin_sessions_active" ON "public"."admin_sessions" USING "btree" ("is_active");



CREATE INDEX "idx_admin_sessions_created_at" ON "public"."admin_sessions" USING "btree" ("created_at");



CREATE INDEX "idx_admin_sessions_expires_at" ON "public"."admin_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_admin_sessions_token" ON "public"."admin_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_admin_sessions_user_id" ON "public"."admin_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_admin_users_active" ON "public"."admin_users" USING "btree" ("is_active");



CREATE INDEX "idx_admin_users_department" ON "public"."admin_users" USING "btree" ("department");



CREATE INDEX "idx_admin_users_email" ON "public"."admin_users" USING "btree" ("email");



CREATE INDEX "idx_admin_users_role" ON "public"."admin_users" USING "btree" ("role");



CREATE INDEX "idx_content_analytics_content" ON "public"."content_analytics" USING "btree" ("content_type", "content_id");



CREATE INDEX "idx_content_analytics_date" ON "public"."content_analytics" USING "btree" ("created_at");



CREATE INDEX "idx_courses_active" ON "public"."courses" USING "btree" ("is_active");



CREATE INDEX "idx_courses_course_code" ON "public"."courses" USING "btree" ("course_code");



CREATE INDEX "idx_courses_is_highlighted" ON "public"."courses" USING "btree" ("is_highlighted") WHERE ("is_highlighted" = true);



CREATE INDEX "idx_courses_semester_id" ON "public"."courses" USING "btree" ("semester_id");



CREATE INDEX "idx_courses_teacher" ON "public"."courses" USING "btree" ("teacher_name");



CREATE INDEX "idx_semesters_active" ON "public"."semesters" USING "btree" ("is_active");



CREATE INDEX "idx_semesters_dates" ON "public"."semesters" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_semesters_section" ON "public"."semesters" USING "btree" ("section");



CREATE INDEX "idx_semesters_title" ON "public"."semesters" USING "btree" ("title");



CREATE INDEX "idx_slides_order" ON "public"."slides" USING "btree" ("topic_id", "order_index");



CREATE INDEX "idx_slides_topic_id" ON "public"."slides" USING "btree" ("topic_id");



CREATE INDEX "idx_study_tools_course_id" ON "public"."study_tools" USING "btree" ("course_id");



CREATE INDEX "idx_study_tools_exam_type" ON "public"."study_tools" USING "btree" ("exam_type");



CREATE INDEX "idx_study_tools_type" ON "public"."study_tools" USING "btree" ("type");



CREATE INDEX "idx_system_logs_date" ON "public"."system_logs" USING "btree" ("created_at");



CREATE INDEX "idx_system_logs_entity" ON "public"."system_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_system_logs_user" ON "public"."system_logs" USING "btree" ("user_id");



CREATE INDEX "idx_topics_course_id" ON "public"."topics" USING "btree" ("course_id");



CREATE INDEX "idx_topics_order" ON "public"."topics" USING "btree" ("course_id", "order_index");



CREATE INDEX "idx_topics_published" ON "public"."topics" USING "btree" ("is_published");



CREATE INDEX "idx_videos_order" ON "public"."videos" USING "btree" ("topic_id", "order_index");



CREATE INDEX "idx_videos_published" ON "public"."videos" USING "btree" ("is_published");



CREATE INDEX "idx_videos_topic_id" ON "public"."videos" USING "btree" ("topic_id");



CREATE OR REPLACE TRIGGER "log_courses_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."log_system_changes"();



CREATE OR REPLACE TRIGGER "log_semesters_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."semesters" FOR EACH ROW EXECUTE FUNCTION "public"."log_system_changes"();



CREATE OR REPLACE TRIGGER "update_courses_updated_at" BEFORE UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_semesters_updated_at" BEFORE UPDATE ON "public"."semesters" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_slides_updated_at" BEFORE UPDATE ON "public"."slides" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_study_tools_updated_at" BEFORE UPDATE ON "public"."study_tools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_topics_updated_at" BEFORE UPDATE ON "public"."topics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_videos_updated_at" BEFORE UPDATE ON "public"."videos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."slides"
    ADD CONSTRAINT "slides_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."study_tools"
    ADD CONSTRAINT "study_tools_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



CREATE POLICY "Public read courses" ON "public"."courses" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public read semesters" ON "public"."semesters" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public read slides" ON "public"."slides" FOR SELECT USING (true);



CREATE POLICY "Public read study_tools" ON "public"."study_tools" FOR SELECT USING (true);



CREATE POLICY "Public read topics" ON "public"."topics" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public read videos" ON "public"."videos" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Service role full access admin_sessions" ON "public"."admin_sessions" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access content_analytics" ON "public"."content_analytics" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access courses" ON "public"."courses" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access semesters" ON "public"."semesters" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access slides" ON "public"."slides" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access study_tools" ON "public"."study_tools" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access system_logs" ON "public"."system_logs" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access topics" ON "public"."topics" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access videos" ON "public"."videos" USING (("current_setting"('role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."admin_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."slides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_tools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."videos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."courses";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."semesters";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."slides";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."study_tools";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."topics";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."videos";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."approve_admin_user"("user_id" "uuid", "approved_by_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_admin_user"("user_id" "uuid", "approved_by_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_admin_user"("user_id" "uuid", "approved_by_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_admin_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_admin_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_admin_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_user_profile"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_user_profile"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_user_profile"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_user_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_user_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_user_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_semester_stats"("semester_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_semester_stats"("semester_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_semester_stats"("semester_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_admin_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_admin_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_system_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_system_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_system_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_login_stats"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_login_stats"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_login_stats"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_users_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_users_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_users_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_sessions" TO "anon";
GRANT ALL ON TABLE "public"."admin_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users_backup" TO "anon";
GRANT ALL ON TABLE "public"."admin_users_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users_backup" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users_backup_auth" TO "anon";
GRANT ALL ON TABLE "public"."admin_users_backup_auth" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users_backup_auth" TO "service_role";



GRANT ALL ON TABLE "public"."content_analytics" TO "anon";
GRANT ALL ON TABLE "public"."content_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."content_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."semesters" TO "anon";
GRANT ALL ON TABLE "public"."semesters" TO "authenticated";
GRANT ALL ON TABLE "public"."semesters" TO "service_role";



GRANT ALL ON TABLE "public"."slides" TO "anon";
GRANT ALL ON TABLE "public"."slides" TO "authenticated";
GRANT ALL ON TABLE "public"."slides" TO "service_role";



GRANT ALL ON TABLE "public"."study_tools" TO "anon";
GRANT ALL ON TABLE "public"."study_tools" TO "authenticated";
GRANT ALL ON TABLE "public"."study_tools" TO "service_role";



GRANT ALL ON TABLE "public"."system_logs" TO "anon";
GRANT ALL ON TABLE "public"."system_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."system_logs" TO "service_role";



GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";



GRANT ALL ON TABLE "public"."videos" TO "anon";
GRANT ALL ON TABLE "public"."videos" TO "authenticated";
GRANT ALL ON TABLE "public"."videos" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
