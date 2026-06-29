#!/bin/bash
# ============================================================
# Script test: Đặt lịch hẹn cho bệnh nhân với bác sĩ đoàn đỗ
# Bác sĩ: id=17, doctor_code=DOC-0006, doctor_name="đoàn đỗ"
# ============================================================

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api/v1"
TODAY=$(date +%Y-%m-%d)

echo "============================================"
echo "  TEST: Đặt lịch hẹn ngày $TODAY"
echo "  Bác sĩ: đoàn đỗ (ID: 17, DOC-0006)"
echo "============================================"
echo ""

# ── Bước 1: Đăng nhập Admin để lấy token ──────────────
echo "▸ Bước 1: Đăng nhập lấy token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medicore.com",
    "password": "admin123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('data',{}).get('token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "  ✗ Đăng nhập thất bại. Response:"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
  echo ""
  echo "  → Thử đăng nhập bác sĩ trực tiếp..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "doc-0006@medicore.com",
      "password": "doctor123"
    }')
  TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('data',{}).get('token',''))" 2>/dev/null)
  
  if [ -z "$TOKEN" ]; then
    echo "  ✗ Vẫn thất bại. Kiểm tra lại server backend!"
    echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
    exit 1
  fi
fi
echo "  ✓ Đăng nhập thành công!"
echo ""

# ── Bước 2: Lấy danh sách bệnh nhân ──────────────────
echo "▸ Bước 2: Lấy danh sách bệnh nhân..."
PATIENTS_RESPONSE=$(curl -s -X GET "$API_URL/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$PATIENTS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
patients = data.get('data', [])
print(f'  ✓ Có {len(patients)} bệnh nhân trong hệ thống')
for p in patients[:5]:
    print(f'    - [{p.get(\"patientCode\",\"?\")}] {p.get(\"name\",\"?\")} (ID: {p.get(\"id\",\"?\")})')
if len(patients) > 5:
    print(f'    ... và {len(patients)-5} bệnh nhân khác')
" 2>/dev/null

# Lấy patientCode của bệnh nhân đầu tiên
PATIENT_CODE=$(echo "$PATIENTS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
patients = data.get('data', [])
if patients:
    print(patients[0].get('patientCode', str(patients[0].get('id',''))))
" 2>/dev/null)

if [ -z "$PATIENT_CODE" ]; then
  echo "  ✗ Không tìm thấy bệnh nhân nào!"
  exit 1
fi
echo ""
echo "  → Sẽ đặt lịch cho bệnh nhân: $PATIENT_CODE"
echo ""

# ── Bước 3: Tạo lịch hẹn WAITING cho ngày hôm nay ────
echo "▸ Bước 3: Tạo lịch hẹn..."
echo "  Doctor ID: 17"
echo "  Patient: $PATIENT_CODE"
echo "  Date: $TODAY"
echo "  Time slot: 08:00 - 09:00"
echo "  Status: WAITING"
echo ""

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/appointments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": \"$PATIENT_CODE\",
    \"doctorId\": 17,
    \"appointmentDate\": \"$TODAY\",
    \"timeSlot\": \"08:00 - 09:00\",
    \"symptomsInitial\": \"Đau đầu, sốt nhẹ, mệt mỏi\",
    \"status\": \"WAITING\"
  }")

echo "  Response:"
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

# Kiểm tra kết quả
SUCCESS=$(echo "$CREATE_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('true' if data.get('status') == 'SUCCESS' or data.get('data') else 'false')
" 2>/dev/null)

if [ "$SUCCESS" = "true" ]; then
  echo "  ✓ Tạo lịch hẹn thành công!"
else
  echo "  ✗ Tạo lịch hẹn thất bại. Thử time slot khác..."
  
  # Thử time slot khác nếu bị trùng
  CREATE_RESPONSE=$(curl -s -X POST "$API_URL/appointments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"patientId\": \"$PATIENT_CODE\",
      \"doctorId\": 17,
      \"appointmentDate\": \"$TODAY\",
      \"timeSlot\": \"09:00 - 10:00\",
      \"symptomsInitial\": \"Đau đầu, sốt nhẹ, mệt mỏi\",
      \"status\": \"WAITING\"
    }")
  
  echo "  Response (time slot 09:00-10:00):"
  echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
  echo ""
fi

# ── Bước 4: Kiểm tra lịch hẹn của bác sĩ ──────────────
echo ""
echo "▸ Bước 4: Kiểm tra lịch hẹn của bác sĩ đoàn đỗ (ID: 17)..."
DOCTOR_APPTS=$(curl -s -X GET "$API_URL/appointments/doctor/17" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$DOCTOR_APPTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
appointments = data.get('data', [])
print(f'  ✓ Bác sĩ có {len(appointments)} lịch hẹn:')
for a in appointments:
    status_icon = '⏳' if a.get('status') == 'WAITING' else '✅' if a.get('status') == 'DONE' else '🔄'
    print(f'    {status_icon} [{a.get(\"status\")}] {a.get(\"patientName\",\"?\")} - {a.get(\"appointmentDate\")} {a.get(\"timeSlot\",\"\")}')
    if a.get('symptomsInitial'):
        print(f'      Triệu chứng: {a.get(\"symptomsInitial\")}')
" 2>/dev/null

echo ""
echo "============================================"
echo "  TEST HOÀN TẤT"
echo "============================================"
