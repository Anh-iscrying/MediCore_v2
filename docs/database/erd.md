# MediCore Database ERD

Source: live Supabase PostgreSQL public schema (`pabogdocgaqzxfehrbhc`).

Last verified: 2026-06-22.

> Reference only. This ERD documents current database structure. It does not apply migrations.

## Mermaid ERD

```mermaid
erDiagram
  AUTH_USERS ||--|| USERS : "id"
  USERS ||--o{ PATIENTS : "user_id"
  USERS ||--o{ DOCTORS : "user_id"
  SPECIALTIES ||--o{ DOCTORS : "specialty_id"
  PATIENTS ||--o{ APPOINTMENTS : "patient_code"
  DOCTORS ||--o{ APPOINTMENTS : "doctor_id"
  APPOINTMENTS ||--o{ MEDICAL_RECORDS : "appointment_id"
  PATIENTS ||--o{ MEDICAL_RECORDS : "patient_code"
  DOCTORS ||--o{ MEDICAL_RECORDS : "doctor_id"
  DISEASES ||--o{ MEDICAL_RECORDS : "diagnosis_icd10"
  MEDICAL_RECORDS ||--o{ PRESCRIPTIONS : "medical_record_id"
  PRESCRIPTIONS ||--o{ PRESCRIPTION_DETAILS : "prescription_id"
  MEDICINES ||--o{ PRESCRIPTION_DETAILS : "medicine_id"
  DOCTORS ||--o{ DOCTOR_SCHEDULES : "doctor_id"
  PATIENTS ||--o{ AI_CONSULTATION_LOGS : "patient_id"
  SPECIALTIES ||--o{ AI_CONSULTATION_LOGS : "suggested_specialty_id"

  AUTH_USERS {
    uuid id PK
  }

  USERS {
    uuid id PK,FK
    text role "ADMIN|DOCTOR|PATIENT"
    timestamptz created_at
    timestamptz updated_at
  }

  SPECIALTIES {
    integer id PK
    varchar specialty_name UK
    timestamptz created_at
  }

  PATIENTS {
    integer id PK
    uuid user_id FK
    varchar patient_code UK
    varchar full_name
    date dob
    text gender "MALE|FEMALE|OTHER"
    varchar phone
    text address
    timestamptz created_at
    timestamptz updated_at
  }

  DOCTORS {
    integer id PK
    uuid user_id FK
    integer specialty_id FK
    varchar doctor_code UK
    varchar doctor_name
    varchar phone
    varchar degree
    integer experience_years
    timestamptz created_at
    timestamptz updated_at
  }

  APPOINTMENTS {
    integer id PK
    varchar patient_id FK
    integer doctor_id FK
    date appointment_date
    varchar time_slot
    text symptoms_initial
    text status "WAITING|IN_PROGRESS|DONE|CANCELLED"
    timestamptz created_at
    timestamptz updated_at
  }

  MEDICINES {
    integer id PK
    varchar medicine_name
    varchar unit
    timestamptz created_at
  }

  DISEASES {
    varchar icd10_code PK
    varchar disease_name
    timestamptz created_at
  }

  MEDICAL_RECORDS {
    integer id PK
    varchar emr_code UK
    integer appointment_id FK
    varchar patient_id FK
    integer doctor_id FK
    varchar diagnosis_icd10 FK
    text clinical_note
    text history_summary
    text care_advice
    timestamptz created_at
  }

  PRESCRIPTIONS {
    integer id PK
    integer medical_record_id FK
    text pdf_url
    timestamptz created_at
  }

  PRESCRIPTION_DETAILS {
    integer id PK
    integer prescription_id FK
    integer medicine_id FK
    integer quantity
    varchar dosage_instruction
    timestamptz created_at
  }

  DOCTOR_SCHEDULES {
    integer id PK
    integer doctor_id FK
    date work_date
    varchar time_slot
    boolean is_booked
    timestamptz updated_at
  }

  AI_CONSULTATION_LOGS {
    integer id PK
    integer patient_id FK
    text symptom_input
    integer suggested_specialty_id FK
    text ai_reasoning
    timestamptz created_at
  }
```

## Relationship notes

| From | To | Note |
|---|---|---|
| `public.users.id` | `auth.users.id` | `auth.users` is managed by Supabase Auth. |
| `public.patients.user_id` | `public.users.id` | `ON DELETE CASCADE`. |
| `public.doctors.user_id` | `public.users.id` | `ON DELETE CASCADE`. |
| `public.doctors.specialty_id` | `public.specialties.id` | Doctor belongs to one specialty. |
| `public.appointments.patient_id` | `public.patients.patient_code` | Uses business key, not numeric patient id. |
| `public.medical_records.patient_id` | `public.patients.patient_code` | Uses business key, not numeric patient id. |
| `public.ai_consultation_logs.patient_id` | `public.patients.id` | Uses numeric patient id. |
| `public.prescription_details.medicine_id` | `public.medicines.id` | Prescription line item references medicine catalog. |

## Constraints and indexes

- Primary keys exist on every table.
- Unique constraints:
  - `specialties.specialty_name`
  - `patients.patient_code`
  - `doctors.doctor_code`
  - `medical_records.emr_code`
- Check constraints:
  - `users.role in ('ADMIN', 'DOCTOR', 'PATIENT')`
  - `patients.gender in ('MALE', 'FEMALE', 'OTHER')`
  - `appointments.status in ('WAITING', 'IN_PROGRESS', 'DONE', 'CANCELLED')`
- Helper indexes:
  - `idx_patients_code`
  - `idx_doctors_code`
  - `idx_appointments_date`
  - `idx_appointments_status`
  - `idx_medical_records_emr`

## Known backend mapping mismatches

Current live DB differs from some JPA entities:

- `public.users.id` is `uuid` and references `auth.users.id`; backend `User` extends `BaseEntity<Long>`.
- `public.users` stores `role` only; backend `User` currently includes `email`, `password`, and `is_active`.
- `public.patients.phone` differs from backend `Patient.phoneNumber` mapped to `phone_number`.
- `appointments.patient_id` and `medical_records.patient_id` reference `patients.patient_code`, while `ai_consultation_logs.patient_id` references `patients.id`.

Aligning JPA entities with this live schema should be separate work.
