-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('LECTURE', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PUBLISHED', 'ACTIVE', 'ARCHIVED', 'DRAFT', 'CLOSED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'REVIEWED', 'RESUBMISSION_REQUIRED');

-- CreateEnum
CREATE TYPE "TrackerStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'REOPENED');

-- CreateEnum
CREATE TYPE "EmployeeInstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "account_status" "AccountStatus" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_role_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permission_id" SERIAL NOT NULL,
    "permission_name" VARCHAR(100) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_permission_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_permission_id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "institution_id" SERIAL NOT NULL,
    "institution_name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("institution_id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "employee_profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "designation" VARCHAR(100),
    "specialization" VARCHAR(100),
    "years_of_experience" INTEGER,
    "joining_date" DATE,
    "is_active" BOOLEAN,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("employee_profile_id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "student_profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "department" VARCHAR(100),
    "academic_year" INTEGER,
    "form_status" "FormStatus" NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("student_profile_id")
);

-- CreateTable
CREATE TABLE "employee_institutions" (
    "employee_institution_id" SERIAL NOT NULL,
    "employee_profile_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "project_lead_employee_id" INTEGER,
    "technical_lead_employee_id" INTEGER,
    "assigned_date" DATE,
    "status" "EmployeeInstitutionStatus" NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "employee_institutions_pkey" PRIMARY KEY ("employee_institution_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" SERIAL NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "institution_courses" (
    "institution_course_id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "institution_courses_pkey" PRIMARY KEY ("institution_course_id")
);

-- CreateTable
CREATE TABLE "modules" (
    "module_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "module_name" VARCHAR(255) NOT NULL,
    "module_description" TEXT,
    "module_order" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "modules_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "lectures" (
    "lecture_id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL,
    "pdf_url" TEXT,
    "estimated_duration_minutes" INTEGER,
    "lecture_status" "LessonStatus" NOT NULL,
    "due_date" TIMESTAMP(3),
    "max_marks" INTEGER,
    "assignment_status" "AssignmentStatus",
    "late_submission_allowed" BOOLEAN NOT NULL DEFAULT false,
    "late_submission_deadline" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "lectures_pkey" PRIMARY KEY ("lecture_id")
);

-- CreateTable
CREATE TABLE "student_course_enrollment" (
    "enrollment_id" SERIAL NOT NULL,
    "student_profile_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrollment_status" "EnrollmentStatus" NOT NULL,
    "completion_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "assigned_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "student_course_enrollment_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "student_progress" (
    "progress_id" BIGSERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "progress_status" "LessonProgressStatus" NOT NULL,
    "started_at" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "last_accessed" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "student_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "submission_id" BIGSERIAL NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "attempt_no" INTEGER NOT NULL DEFAULT 1,
    "previous_submission_id" BIGINT,
    "resubmission_reason" TEXT,
    "submission_url" TEXT,
    "remarks" TEXT,
    "marks_obtained" DECIMAL(5,2),
    "trainer_feedback" TEXT,
    "submission_status" "SubmissionStatus" NOT NULL,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "trainer_substitutions" (
    "trainer_substitution_id" SERIAL NOT NULL,
    "original_trainer_id" INTEGER NOT NULL,
    "replacement_trainer_id" INTEGER NOT NULL,
    "leave_from" DATE,
    "leave_to" DATE,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_substitutions_pkey" PRIMARY KEY ("trainer_substitution_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_name_key" ON "permissions"("permission_name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institution_name_key" ON "institutions"("institution_name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_user_id_key" ON "employee_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "student_profiles_institution_id_idx" ON "student_profiles"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_institutions_employee_profile_id_institution_id_key" ON "employee_institutions"("employee_profile_id", "institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "institution_courses_institution_id_course_id_key" ON "institution_courses"("institution_id", "course_id");

-- CreateIndex
CREATE INDEX "modules_course_id_idx" ON "modules"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "modules_course_id_module_order_key" ON "modules"("course_id", "module_order");

-- CreateIndex
CREATE INDEX "lectures_module_id_idx" ON "lectures"("module_id");

-- CreateIndex
CREATE INDEX "lectures_content_type_idx" ON "lectures"("content_type");

-- CreateIndex
CREATE INDEX "lectures_lecture_status_idx" ON "lectures"("lecture_status");

-- CreateIndex
CREATE UNIQUE INDEX "lectures_module_id_display_order_key" ON "lectures"("module_id", "display_order");

-- CreateIndex
CREATE INDEX "student_course_enrollment_course_id_idx" ON "student_course_enrollment"("course_id");

-- CreateIndex
CREATE INDEX "student_course_enrollment_enrollment_status_idx" ON "student_course_enrollment"("enrollment_status");

-- CreateIndex
CREATE UNIQUE INDEX "student_course_enrollment_student_profile_id_course_id_key" ON "student_course_enrollment"("student_profile_id", "course_id");

-- CreateIndex
CREATE INDEX "student_progress_lecture_id_idx" ON "student_progress"("lecture_id");

-- CreateIndex
CREATE INDEX "student_progress_progress_status_idx" ON "student_progress"("progress_status");

-- CreateIndex
CREATE INDEX "student_progress_last_accessed_idx" ON "student_progress"("last_accessed");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_enrollment_id_lecture_id_key" ON "student_progress"("enrollment_id", "lecture_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_enrollment_id_idx" ON "assignment_submissions"("enrollment_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_submission_status_idx" ON "assignment_submissions"("submission_status");

-- CreateIndex
CREATE INDEX "assignment_submissions_reviewed_by_idx" ON "assignment_submissions"("reviewed_by");

-- CreateIndex
CREATE INDEX "assignment_submissions_reviewed_at_idx" ON "assignment_submissions"("reviewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_lecture_id_enrollment_id_attempt_no_key" ON "assignment_submissions"("lecture_id", "enrollment_id", "attempt_no");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_institutions" ADD CONSTRAINT "employee_institutions_employee_profile_id_fkey" FOREIGN KEY ("employee_profile_id") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_institutions" ADD CONSTRAINT "employee_institutions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_institutions" ADD CONSTRAINT "employee_institutions_project_lead_employee_id_fkey" FOREIGN KEY ("project_lead_employee_id") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_institutions" ADD CONSTRAINT "employee_institutions_technical_lead_employee_id_fkey" FOREIGN KEY ("technical_lead_employee_id") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_institutions" ADD CONSTRAINT "employee_institutions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_institutions" ADD CONSTRAINT "employee_institutions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_courses" ADD CONSTRAINT "institution_courses_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_courses" ADD CONSTRAINT "institution_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_courses" ADD CONSTRAINT "institution_courses_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_enrollment" ADD CONSTRAINT "student_course_enrollment_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("student_profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_enrollment" ADD CONSTRAINT "student_course_enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_enrollment" ADD CONSTRAINT "student_course_enrollment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_enrollment" ADD CONSTRAINT "student_course_enrollment_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "student_course_enrollment"("enrollment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("lecture_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("lecture_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "student_course_enrollment"("enrollment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_previous_submission_id_fkey" FOREIGN KEY ("previous_submission_id") REFERENCES "assignment_submissions"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_substitutions" ADD CONSTRAINT "trainer_substitutions_original_trainer_id_fkey" FOREIGN KEY ("original_trainer_id") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_substitutions" ADD CONSTRAINT "trainer_substitutions_replacement_trainer_id_fkey" FOREIGN KEY ("replacement_trainer_id") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;
