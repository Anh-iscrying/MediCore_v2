# Database documentation

Source: live Supabase PostgreSQL public schema for project `pabogdocgaqzxfehrbhc`.

Last verified: 2026-06-22.

## Files

- [ERD](erd.md) — Mermaid diagram and relationship notes.
- [Schema SQL](schema.sql) — SQL snapshot/reference only.

Backend copy:

- `code/backend/src/main/resources/db/schema.sql`
- `code/backend/src/main/resources/db/README.md`

## Current public tables

| Table | Estimated rows | Purpose |
|---|---:|---|
| `users` | 1 | Application profile linked to Supabase Auth user. |
| `specialties` | 6 | Medical specialty catalog. |
| `patients` | 6 | Patient profile and patient code. |
| `doctors` | 5 | Doctor profile and specialty. |
| `appointments` | 3 | Booking and queue status. |
| `medicines` | 12 | Medicine catalog. |
| `diseases` | 6 | ICD-10 disease catalog. |
| `medical_records` | 2 | EMR records for visits. |
| `prescriptions` | 2 | Prescription header per EMR. |
| `prescription_details` | 4 | Prescription medicine line items. |
| `doctor_schedules` | 6 | Doctor available slots. |
| `ai_consultation_logs` | 3 | AI symptom triage logs. |

## Main relationship summary

- `public.users.id` references Supabase `auth.users.id`.
- `patients.user_id` and `doctors.user_id` reference `users.id`.
- `doctors.specialty_id` references `specialties.id`.
- `appointments.patient_id` references `patients.patient_code`.
- `appointments.doctor_id` references `doctors.id`.
- `medical_records` links appointment, patient, doctor, and ICD-10 disease.
- `prescriptions` and `prescription_details` link medical records to medicines.
- `doctor_schedules` links doctors to work slots.
- `ai_consultation_logs` links patient and suggested specialty.

## Important notes

### Snapshot only

`schema.sql` documents current live DB shape. It is not a migration and should not be applied automatically.

Do not copy it into `code/backend/src/main/resources/db/migration/V1__init_schema.sql` until:

1. JPA entities match live schema.
2. Flyway/Liquibase is configured.
3. Migration history is agreed.

### RLS disabled

Supabase advisor reports Row Level Security is disabled on all 12 public tables.

Do not enable RLS blindly. Enabling RLS without policies can block backend/app access. Create role-based policies first, then enable table by table.

### Backend JPA mismatch

Current live DB differs from backend JPA entities:

- `users.id` is UUID and references `auth.users.id`; backend `BaseEntity` uses `Long id`.
- Live `public.users` has `role`, `created_at`, `updated_at`; backend `User` has `email`, `password`, `is_active`.
- Live `patients.phone`; backend entity maps `phone_number`.
- Patient references are mixed: some use `patients.patient_code`, AI logs use `patients.id`.

Aligning backend entities should be a separate task.

## How to refresh docs

1. Connect to Supabase using `code/backend/.env`.
2. Query `information_schema.columns`, `pg_constraint`, and `pg_indexes` for `public` schema.
3. Update:
   - `docs/database/erd.md`
   - `docs/database/schema.sql`
   - `code/backend/src/main/resources/db/schema.sql`
4. Do not run DDL unless migration task explicitly approved.
