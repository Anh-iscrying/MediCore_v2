# Supabase PostgreSQL setup cho MediCore

## Mục tiêu

Backend Spring Boot kết nối Supabase PostgreSQL qua JDBC. Frontend Next.js gọi backend qua API base URL. Frontend không kết nối trực tiếp Supabase và không dùng Supabase service key.

## Luồng kết nối

```text
Next.js frontend
  -> NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
  -> Spring Boot backend
  -> DB_URL=jdbc:postgresql://.../postgres?sslmode=require
  -> Supabase PostgreSQL
```

## File cấu hình

### Backend env

File local ignored, không commit:

```text
code/backend/.env
```

Biến cần có:

```env
DB_URL=jdbc:postgresql://<supabase-db-host>:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=<database-password>
JWT_SECRET=<jwt-secret>
JWT_EXPIRATION=86400000
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000
```

Lưu ý:

- `DB_URL` dùng PostgreSQL JDBC URL, không dùng Supabase API URL.
- `DB_PASSWORD` lấy trong Supabase Dashboard > Project Settings > Database.
- Không commit `.env`, `.env.local`, hoặc file chứa password.

### Backend application config

File:

```text
code/backend/src/main/resources/application.yml
```

Backend đọc env:

```yaml
server:
  port: ${SERVER_PORT:8080}

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

Context path backend:

```text
/api/v1
```

Ví dụ endpoint đăng ký:

```text
POST http://localhost:8080/api/v1/auth/register
```

### Frontend env

File local ignored, không commit:

```text
code/frontend/.env.local
```

Nội dung:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Frontend API helper đọc biến này trong:

```text
code/frontend/src/lib/api.ts
```

Auth service:

```text
code/frontend/src/services/auth.ts
```

## CORS

File cấu hình:

```text
code/backend/src/main/java/com/medicore/config/SecurityConfig.java
```

Backend cho phép origin từ:

```env
FRONTEND_URL=http://localhost:3000
```

Allowed methods:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Allowed headers:

```text
Authorization, Content-Type
```

## Chạy backend

Cần Maven hoặc Maven wrapper. Hiện repo chưa có `mvnw`, máy cần cài `mvn`.

```bash
cd /Users/doando/Documents/medicore/MediCore_v2/code/backend
mvn spring-boot:run
```

Nếu chưa cài Maven:

```bash
brew install maven
```

## Chạy frontend

```bash
cd /Users/doando/Documents/medicore/MediCore_v2/code/frontend
npm install
npm run dev
```

Mở:

```text
http://localhost:3000
```

## Test kết nối database bằng Python

Máy hiện có `asyncpg`, nên có thể test nhanh mà không cần Maven:

```bash
python3 - <<'PY'
import asyncio
import ssl
from pathlib import Path
from urllib.parse import urlparse

ENV_PATH = Path('/Users/doando/Documents/medicore/MediCore_v2/code/backend/.env')

def load_env(path):
    data = {}
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data

def parse_jdbc(url):
    parsed = urlparse(url.replace('jdbc:postgresql://', 'postgresql://', 1))
    return parsed.hostname, parsed.port or 5432, parsed.path.lstrip('/') or 'postgres'

async def main():
    import asyncpg
    env = load_env(ENV_PATH)
    host, port, database = parse_jdbc(env['DB_URL'])
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    conn = await asyncpg.connect(
        host=host,
        port=port,
        database=database,
        user=env['DB_USERNAME'],
        password=env['DB_PASSWORD'],
        ssl=ssl_context,
        timeout=15,
    )

    try:
        row = await conn.fetchrow('select current_database() as database, current_user as user_name')
        print(dict(row))

        tables = await conn.fetch("""
            select relname, n_live_tup::bigint as estimated_rows
            from pg_stat_user_tables
            where schemaname = 'public'
            order by relname
        """)
        for table in tables:
            print(dict(table))
    finally:
        await conn.close()

asyncio.run(main())
PY
```

Kết quả mong đợi:

```text
connected database=postgres user=postgres
```

và danh sách bảng public.

## Test CORS

Khi backend đang chạy:

```bash
curl -i -X OPTIONS http://localhost:8080/api/v1/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

Kết quả cần thấy header kiểu:

```text
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

## Test API đăng ký

Khi backend đang chạy:

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","role":"PATIENT","fullName":"Test Patient","phoneNumber":"0900000000","dob":"1990-01-01","gender":"MALE"}'
```

Nếu dùng lại email cũ, backend có thể trả lỗi email đã tồn tại.

## Bảng đã đọc được khi test

Kết nối trực tiếp tới Supabase PostgreSQL đã thành công và đọc được metadata bảng public:

```text
ai_consultation_logs: 3
appointments: 3
diseases: 6
doctor_schedules: 6
doctors: 5
medical_records: 2
medicines: 12
patients: 6
prescription_details: 4
prescriptions: 2
specialties: 6
users: 1
```

Sample đọc được:

```text
specialties:
- Nội khoa
- Ngoại khoa
- Tim mạch

medicines:
- Paracetamol 500mg
- Amoxicillin 500mg
- Vitamin C 1000mg
```

## Lưu ý bảo mật Supabase

Supabase advisory báo RLS đang tắt trên 12 bảng public. Không bật RLS ngay nếu chưa có policies, vì app có thể bị chặn toàn bộ truy cập.

Task follow-up nên làm:

1. Thiết kế policies theo role: admin, doctor, patient.
2. Bật RLS từng bảng.
3. Test backend flow sau khi bật RLS.

## Lỗi thường gặp

### `mvn: command not found`

Máy chưa cài Maven hoặc repo chưa có Maven wrapper.

Fix:

```bash
brew install maven
```

hoặc thêm Maven wrapper vào repo.

### SSL verify fail khi test bằng Python

Supabase direct DB có thể báo cert chain khi Python verify đầy đủ. JDBC `sslmode=require` chỉ yêu cầu SSL, không verify CA giống `verify-full`. Script test dùng SSL context không verify hostname để mô phỏng hành vi này.

### Frontend gọi API bị CORS

Kiểm tra:

- Backend đang chạy port `8080`.
- `FRONTEND_URL=http://localhost:3000` trong `code/backend/.env`.
- Frontend chạy đúng `http://localhost:3000`.
- API base là `http://localhost:8080/api/v1`.
