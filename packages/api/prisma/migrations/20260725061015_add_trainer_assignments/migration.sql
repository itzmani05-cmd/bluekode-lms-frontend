-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('STUDENT', 'INSTITUTION');

-- CreateTable
CREATE TABLE "trainer_assignments" (
    "trainer_assignment_id" SERIAL NOT NULL,
    "trainer_employee_profile_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "assignment_type" "AssignmentType" NOT NULL,
    "student_profile_id" INTEGER,
    "institution_id" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "trainer_assignments_pkey" PRIMARY KEY ("trainer_assignment_id")
);

-- CreateIndex
CREATE INDEX "trainer_assignments_trainer_employee_profile_id_idx" ON "trainer_assignments"("trainer_employee_profile_id");

-- CreateIndex
CREATE INDEX "trainer_assignments_course_id_idx" ON "trainer_assignments"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_assignments_trainer_employee_profile_id_course_id_s_key" ON "trainer_assignments"("trainer_employee_profile_id", "course_id", "student_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_assignments_trainer_employee_profile_id_course_id_i_key" ON "trainer_assignments"("trainer_employee_profile_id", "course_id", "institution_id");

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_trainer_employee_profile_id_fkey" FOREIGN KEY ("trainer_employee_profile_id") REFERENCES "employee_profiles"("employee_profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("student_profile_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("institution_id") ON DELETE SET NULL ON UPDATE CASCADE;
