# Backend DB resources

This folder contains database reference files for backend developers.

## Files

- `schema.sql` — Supabase live schema snapshot for reference only.
- `migration/` — reserved for future Flyway/Liquibase migrations.

## Important

`schema.sql` is not executed automatically by Spring Boot. It is a readable copy of the live Supabase public schema so backend developers can inspect tables, columns, keys, and relationships near backend code.

Do not copy `schema.sql` into `migration/V1__init_schema.sql` until:

1. Backend JPA entities are aligned with live Supabase schema.
2. Flyway or Liquibase is added and configured.
3. Migration history strategy is agreed.

Current app config still uses:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

## Source docs

Full docs live in:

```text
docs/database/README.md
docs/database/erd.md
docs/database/schema.sql
```

## Known live DB notes

- `public.users.id` is UUID and references Supabase `auth.users.id`.
- `appointments.patient_id` references `patients.patient_code`.
- `medical_records.patient_id` references `patients.patient_code`.
- `ai_consultation_logs.patient_id` references `patients.id`.
- RLS is currently disabled on public tables; design policies before enabling.
