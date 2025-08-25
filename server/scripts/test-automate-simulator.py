import socket
import time
import random
from datetime import datetime

# ===== DB integration helpers =====
import os
import json
import uuid
from pathlib import Path
from urllib.parse import urlparse

try:
    import psycopg2  # pip install psycopg2-binary
    _PG_OK = True
except Exception:
    _PG_OK = False


def _load_database_url():
    # Prefer environment
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    # Try reading ../.env
    try:
        env_path = Path(__file__).resolve().parents[1] / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line.startswith("DATABASE_URL"):
                    # supports lines like DATABASE_URL="..."
                    _, val = line.split("=", 1)
                    val = val.strip().strip('"').strip("'")
                    return val
    except Exception:
        pass
    return None


def _parse_pg_url(url: str):
    # Remove prisma schema query if present
    if "?" in url:
        url_no_qs = url.split("?", 1)[0]
    else:
        url_no_qs = url
    p = urlparse(url_no_qs)
    user = p.username
    password = p.password
    host = p.hostname or "localhost"
    port = p.port or 5432
    dbname = (p.path or "/").lstrip("/")
    return dict(user=user, password=password, host=host, port=port, dbname=dbname)


class DBClient:
    def __init__(self):
        self.available = False
        self.conn = None
        self.db_url = _load_database_url()
        if _PG_OK and self.db_url:
            try:
                params = _parse_pg_url(self.db_url)
                self.conn = psycopg2.connect(**params)
                self.conn.autocommit = True
                self.available = True
            except Exception as e:
                print(f"[DB] Could not connect to Postgres: {e}")
                self.available = False
        else:
            if not _PG_OK:
                print("[DB] psycopg2 is not installed. Run: pip install psycopg2-binary")

    def close(self):
        try:
            if self.conn:
                self.conn.close()
        except Exception:
            pass

    # Automate helpers
    def get_or_create_automate(self, config):
        if not self.available:
            return None
        try:
            with self.conn.cursor() as cur:
                cur.execute('SELECT id FROM "Automate" WHERE name = %s LIMIT 1', (config.get('name'),))
                row = cur.fetchone()
                if row:
                    return row[0]
                # insert with explicit id and timestamps
                new_id = str(uuid.uuid4())
                cur.execute(
                    'INSERT INTO "Automate" ("id", name, type, manufacturer, protocol, connection, config, enabled, status, "createdAt", "updatedAt")\n'
                    'VALUES (%s,%s,%s,%s,%s,%s,%s,true,%s,NOW(),NOW())',
                    (
                        new_id,
                        config.get('name'),
                        config.get('type'),
                        config.get('manufacturer'),
                        config.get('protocol'),
                        config.get('connection'),
                        json.dumps(config.get('config', {})),
                        'online'
                    )
                )
                return new_id
        except Exception as e:
            print(f"[DB] Automate upsert failed: {e}")
            return None

    def get_any_analysis(self):
        if not self.available:
            return None
        try:
            with self.conn.cursor() as cur:
                # Prefer one with recent request usage
                cur.execute(
                    'SELECT a.id, a.code, a.name FROM "Analysis" a\n'
                    'LEFT JOIN "RequestAnalysis" ra ON ra."analysisId" = a.id\n'
                    'ORDER BY (ra.id IS NOT NULL) DESC, a.name ASC LIMIT 1'
                )
                row = cur.fetchone()
                if row:
                    return { 'id': row[0], 'code': row[1], 'name': row[2] }
        except Exception as e:
            print(f"[DB] Fetch analysis failed: {e}")
        return None

    def ensure_request_for_analysis(self, analysis_id):
        if not self.available:
            return None
        try:
            with self.conn.cursor() as cur:
                # Try to find an existing request using this analysis
                cur.execute(
                    'SELECT ra."requestId" FROM "RequestAnalysis" ra\n'
                    'WHERE ra."analysisId" = %s ORDER BY ra.id DESC LIMIT 1', (analysis_id,)
                )
                row = cur.fetchone()
                if row:
                    return row[0]

                # Need to create a minimal request
                cur.execute('SELECT id FROM "User" WHERE role = %s LIMIT 1', ('ADMIN',))
                u = cur.fetchone()
                cur.execute('SELECT id FROM "Patient" LIMIT 1')
                p = cur.fetchone()
                cur.execute('SELECT id FROM "Doctor" LIMIT 1')
                d = cur.fetchone()
                if not (u and p):
                    print('[DB] Missing ADMIN user or Patient. Seed your DB first.')
                    return None
                created_by, patient_id = u[0], p[0]
                doctor_id = d[0] if d else None

                if doctor_id:
                    cur.execute(
                        'INSERT INTO "Request" ("patientId","doctorId","createdById") VALUES (%s,%s,%s) RETURNING id',
                        (patient_id, doctor_id, created_by)
                    )
                else:
                    cur.execute(
                        'INSERT INTO "Request" ("patientId","createdById") VALUES (%s,%s) RETURNING id',
                        (patient_id, created_by)
                    )
                req_id = cur.fetchone()[0]

                # Link analysis to request
                cur.execute(
                    'INSERT INTO "RequestAnalysis" ("requestId","analysisId","price") VALUES (%s,%s,%s)',
                    (req_id, analysis_id, 0.0)
                )
                return req_id
        except Exception as e:
            print(f"[DB] Ensure request failed: {e}")
            return None

    def upsert_result(self, request_id, analysis_id, value: str, unit: str = None, reference: str = None, status: str = 'PENDING'):
        if not self.available:
            return False
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    'SELECT id FROM "Result" WHERE "requestId"=%s AND "analysisId"=%s LIMIT 1',
                    (request_id, analysis_id)
                )
                row = cur.fetchone()
                if row:
                    # For PENDING status, don't set validatedAt or validatedBy
                    if status == 'PENDING':
                        cur.execute(
                            'UPDATE "Result" SET value=%s, unit=%s, reference=%s, status=%s, "validatedAt"=NULL, "validatedBy"=NULL, "updatedAt"=NOW() WHERE id=%s',
                            (value, unit, reference, status, row[0])
                        )
                    else:
                        cur.execute(
                            'UPDATE "Result" SET value=%s, unit=%s, reference=%s, status=%s, "validatedAt"=NOW(), "validatedBy"=%s, "updatedAt"=NOW() WHERE id=%s',
                            (value, unit, reference, status, 'system', row[0])
                        )
                else:
                    # For PENDING status, don't set validatedAt or validatedBy
                    if status == 'PENDING':
                        # For PENDING status, don't include validatedAt or validatedBy in the INSERT
                        # Generate a new UUID for the result
                        result_id = str(uuid.uuid4())
                        cur.execute(
                            'INSERT INTO "Result" ("id","requestId","analysisId",value,unit,reference,status,"updatedAt")\n'
                            'VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())',
                            (result_id, request_id, analysis_id, value, unit, reference, status)
                        )
                    else:
                        # Generate a new UUID for the result
                        result_id = str(uuid.uuid4())
                        cur.execute(
                            'INSERT INTO "Result" ("id","requestId","analysisId",value,unit,reference,status,"validatedAt","validatedBy","updatedAt")\n'
                            'VALUES (%s,%s,%s,%s,%s,%s,%s,NOW(),%s,NOW())',
                            (result_id, request_id, analysis_id, value, unit, reference, status, 'system')
                        )
                return True
        except Exception as e:
            print(f"[DB] Upsert result failed: {e}")
            return False

    def insert_transfer_log(self, automate_id, type_: str, status: str, duration_ms: int, error_msg: str = None):
        if not self.available or not automate_id:
            return False
        try:
            with self.conn.cursor() as cur:
                new_id = str(uuid.uuid4())
                cur.execute(
                    'INSERT INTO "AutomateTransferLog" ("id","automateId", type, status, duration, "errorMsg", "timestamp") VALUES (%s,%s,%s,%s,%s,%s,NOW())',
                    (new_id, automate_id, type_, status, duration_ms, error_msg)
                )
                return True
        except Exception as e:
            print(f"[DB] Insert transfer log failed: {e}")
            return False

# global DB client
_DB = DBClient()


def create_random_request_and_result():
    if not _DB.available:
        print('[DB] Database not available. Install psycopg2-binary and configure DATABASE_URL.')
        return
    from datetime import timedelta
    start_ts = time.time()
    automate_id = None
    try:
        automate_id = _DB.get_or_create_automate(AUTOMATE_CONFIG)
        with _DB.conn.cursor() as cur:
            # Pick random analysis
            cur.execute('SELECT id, code, name, price FROM "Analysis" ORDER BY RANDOM() LIMIT 1')
            row = cur.fetchone()
            if not row:
                print('[DB] No analyses found. Seed DB first.')
                return
            analysis_id, analysis_code, analysis_name, analysis_price = row[0], row[1], row[2], row[3] or 0.0

            # Admin user
            cur.execute('SELECT id FROM "User" WHERE role=%s LIMIT 1', ('ADMIN',))
            u = cur.fetchone()
            if not u:
                print('[DB] No ADMIN user found. Seed DB first.')
                return
            admin_id = u[0]

            # Any doctor (nullable)
            cur.execute('SELECT id FROM "Doctor" ORDER BY RANDOM() LIMIT 1')
            d = cur.fetchone()
            doctor_id = d[0] if d else None

            # Create random patient
            first_names = ['Test', 'Demo', 'Sample', 'Trial', 'Mock']
            last_names = ['Patient', 'User', 'Record', 'Case', 'Entry']
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            suffix = datetime.now().strftime('%Y%m%d%H%M%S') + str(random.randint(100,999))
            email = f'{fn.lower()}.{ln.lower()}.{suffix}@example.com'
            cnss = f'CNSS-{suffix}'
            # random DOB between 1950-01-01 and 2010-12-31
            start_date = datetime(1950,1,1)
            end_date = datetime(2010,12,31)
            delta_days = (end_date - start_date).days
            dob = (start_date + timedelta(days=random.randint(0, delta_days))).date()
            gender = random.choice(['M','F'])

            # Generate explicit IDs to satisfy NOT NULL id columns without default
            patient_id = str(uuid.uuid4())
            cur.execute('INSERT INTO "Patient" ("id","firstName","lastName","dateOfBirth","gender","email","cnssNumber","createdAt","updatedAt") VALUES (%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())',
                        (patient_id, fn, ln, dob, gender, email, cnss))

            # Create request with explicit ID
            request_id = str(uuid.uuid4())
            if doctor_id:
                cur.execute('INSERT INTO "Request" ("id","patientId","doctorId","createdById","status","priority","createdAt","updatedAt") VALUES (%s,%s,%s,%s,%s,%s,NOW(),NOW())',
                            (request_id, patient_id, doctor_id, admin_id, 'IN_PROGRESS', 'NORMAL'))
            else:
                cur.execute('INSERT INTO "Request" ("id","patientId","createdById","status","priority","createdAt","updatedAt") VALUES (%s,%s,%s,%s,%s,NOW(),NOW())',
                            (request_id, patient_id, admin_id, 'IN_PROGRESS', 'NORMAL'))

            # Link analysis with explicit ID
            ra_id = str(uuid.uuid4())
            cur.execute('INSERT INTO "RequestAnalysis" ("id","requestId","analysisId","price") VALUES (%s,%s,%s,%s)',
                        (ra_id, request_id, analysis_id, float(analysis_price)))

        # Create random numeric result (pending validation)
        value = round(random.uniform(0.1, 250.0), 2)
        _DB.upsert_result(request_id, analysis_id, str(value), unit=None, reference=None)

        # Build HL7 ORU for the same patient/request with the chosen analysis
        hl7 = HL7Message()
        test = { 'code': analysis_code, 'name': analysis_name, 'unit': '', 'ref_range': '' }
        segments = [
            hl7.create_msh_segment("ORU^R01"),
            hl7.create_pid_segment(patient_id),
            hl7.create_obr_segment("1", request_id),
            hl7.create_obx_segment("1", test, str(value), test['unit'], test['ref_range'], 'N')
        ]
        hl7_message = "\r".join(segments) + "\r"
        wrapped = b'\x0b' + hl7_message.encode('utf-8') + b'\x1c\x0d'

        status = 'failed'
        error = None
        t0 = time.time()
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((AUTOMATE_CONFIG['config']['ipAddress'], AUTOMATE_CONFIG['config']['port']))
            sock.settimeout(5)
            sock.send(wrapped)
            try:
                _ack = sock.recv(1024)
                status = 'success'
            except socket.timeout:
                error = 'ACK timeout'
        except Exception as e:
            error = str(e)
        finally:
            try:
                sock.close()
            except Exception:
                pass

        duration_ms = int((time.time() - t0) * 1000)
        _DB.insert_transfer_log(automate_id, 'result', status, duration_ms, error)

        # Show full info block
        print("\n===== NEW TEST DATA CREATED =====")
        print(f"Automate: {AUTOMATE_CONFIG['name']}")
        print(f"Patient ID: {patient_id} | Name: {fn} {ln} | DOB: {dob} | Gender: {gender} | Email: {email} | CNSS: {cnss}")
        print(f"Request ID: {request_id} | Status: IN_PROGRESS | Priority: NORMAL")
        print(f"Analysis: {analysis_code} - {analysis_name} | Price: {analysis_price}")
        print(f"Result: {value} (PENDING VALIDATION)")
        print(f"Transfer Log: {status} | Duration: {duration_ms} ms | Error: {error}")
        print("\nHL7 message sent:")
        print("-" * 80)
        print(hl7_message.replace("\r", "\n"))
        print("-" * 80)
        print("================================\n")
    except Exception as e:
        print(f"[DB] Error creating random request/result: {e}")

# Automate Configuration
AUTOMATE_CONFIG = {
    "id": "cme34g4bh0000132n0540xlxz",
    "name": "TEST-PYTHON",
    "type": "Immunoassay",
    "manufacturer": "Siemens",
    "protocol": "HL7",
    "connection": "tcp",
    "config": {
        "port": 2027,
        "ipAddress": "127.0.0.1",  # Modifiez l'IP si nécessaire
        "autoSendWorklist": True,
        "autoReceiveResults": True,
        "enableQCMonitoring": True
    }
}

# Test Data Configuration
TEST_CODES = [
    {"code": "TSH", "name": "Thyroid Stimulating Hormone", "unit": "mIU/L", "ref_range": "0.4-4.0"},
    {"code": "FT4", "name": "Free Thyroxine", "unit": "ng/dL", "ref_range": "0.8-1.8"},
    {"code": "FT3", "name": "Free Triiodothyronine", "unit": "pg/mL", "ref_range": "2.3-4.2"},
    {"code": "FERR", "name": "Ferritin", "unit": "ng/mL", "ref_range": "30-400"},
    {"code": "B12", "name": "Vitamin B12", "unit": "pg/mL", "ref_range": "200-900"}
]

class HL7Message:
    def __init__(self):
        self.separators = {'field': '|', 'component': '^', 'subcomponent': '&', 'repeat': '~', 'escape': '\\'}
    
    def create_msh_segment(self, message_type):
        now = datetime.now().strftime("%Y%m%d%H%M%S")
        return (
            f"MSH{self.separators['field']}^~\\&{self.separators['field']}"
            f"{AUTOMATE_CONFIG['name']}{self.separators['field']}"
            f"SIL-LIS{self.separators['field']}"
            f"{AUTOMATE_CONFIG['manufacturer']}{self.separators['field']}"
            f"LAB{self.separators['field']}"
            f"{now}{self.separators['field']}"
            f"{self.separators['field']}"
            f"{message_type}{self.separators['field']}"
            f"{AUTOMATE_CONFIG['id'][:8]}{self.separators['field']}"
            f"P{self.separators['field']}"
            f"2.5.1"
        )

    def create_pid_segment(self, patient_id="TEST001"):
        return (
            f"PID{self.separators['field']}"
            f"1{self.separators['field']}"
            f"{patient_id}{self.separators['field']}"
            f"{patient_id}{self.separators['field']}"
            f"{self.separators['field']}"
            f"TESTPATIENT^TEST{self.separators['field']}"
            f"{self.separators['field']}"
            f"19900101{self.separators['field']}"
            f"M"
        )

    def create_obr_segment(self, set_id="1", request_id="REQ001"):
        now = datetime.now().strftime("%Y%m%d%H%M%S")
        return (
            f"OBR{self.separators['field']}"
            f"{set_id}{self.separators['field']}"
            f"{request_id}{self.separators['field']}"
            f"{self.separators['field']}"
            f"IMMUNOASSAY{self.separators['field']}"
            f"{self.separators['field']}"
            f"{now}{self.separators['field']}"
            f"{now}"
        )

    def create_obx_segment(self, set_id, test_code, value, unit, reference_range, abnormal_flags='N'):
        now = datetime.now().strftime("%Y%m%d%H%M%S")
        return (
            f"OBX{self.separators['field']}"
            f"{set_id}{self.separators['field']}"
            f"NM{self.separators['field']}"
            f"{test_code['code']}^{test_code['name']}{self.separators['field']}"
            f"{self.separators['field']}"
            f"{value}{self.separators['field']}"
            f"{test_code['unit']}{self.separators['field']}"
            f"{test_code['ref_range']}{self.separators['field']}"
            f"{abnormal_flags}{self.separators['field']}"
            f"{self.separators['field']}"
            f"{self.separators['field']}"
            f"F{self.separators['field']}"
            f"{self.separators['field']}"
            f"{now}"
        )

    def generate_random_value(self, ref_range):
        low, high = map(float, ref_range.split('-'))
        # Sometimes generate abnormal values
        if random.random() < 0.2:  # 20% chance of abnormal value
            if random.random() < 0.5:
                value = low - (low * random.uniform(0.1, 0.5))  # Below range
            else:
                value = high + (high * random.uniform(0.1, 0.5))  # Above range
        else:
            value = random.uniform(low, high)  # Within range
        return round(value, 2)

    def create_result_message(self, patient_id="TEST001", request_id="REQ001"):
        segments = [
            self.create_msh_segment("ORU^R01"),
            self.create_pid_segment(patient_id),
            self.create_obr_segment("1", request_id)
        ]

        # Generate random results for each test
        for idx, test in enumerate(TEST_CODES, 1):
            value = self.generate_random_value(test['ref_range'])
            low, high = map(float, test['ref_range'].split('-'))
            abnormal_flag = 'L' if value < low else 'H' if value > high else 'N'
            segments.append(
                self.create_obx_segment(str(idx), test, str(value), 
                                      test['unit'], test['ref_range'], 
                                      abnormal_flag)
            )

        return "\r".join(segments) + "\r"

def send_hl7_message(host=None, port=None):
    if host is None:
        host = AUTOMATE_CONFIG['config']['ipAddress']
    if port is None:
        port = AUTOMATE_CONFIG['config']['port']

    automate_id = None
    selected_analysis = None
    linked_request_id = None
    status_for_log = 'failed'
    error_for_log = None
    start_ts = time.time()

    try:
        # Prepare DB entities (best-effort)
        automate_id = _DB.get_or_create_automate(AUTOMATE_CONFIG)
        selected_analysis = _DB.get_any_analysis()
        if selected_analysis:
            linked_request_id = _DB.ensure_request_for_analysis(selected_analysis['id'])

        # Create socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        print(f"Connecting to {host}:{port}...")
        sock.connect((host, port))
        print(f"Connected successfully to {host}:{port}")

        # Create and send HL7 message
        hl7 = HL7Message()
        request_label = f"REQ{datetime.now().strftime('%Y%m%d%H%M%S')}"  # HL7 OBR-2 label only
        message = hl7.create_result_message(request_id=request_label)
        
        # Add MLLP wrapping
        wrapped_message = b'\x0b' + message.encode('utf-8') + b'\x1c\x0d'
        
        print("\nSending HL7 message:")
        print("=" * 80)
        print(message.replace("\r", "\n"))
        print("=" * 80)
        
        # Send message
        sock.send(wrapped_message)
        
        # Wait for acknowledgment with timeout
        sock.settimeout(5)  # 5 seconds timeout
        try:
            ack = sock.recv(1024)
            print("\nReceived acknowledgment:")
            print("-" * 80)
            print(ack.decode('utf-8').replace("\r", "\n"))
            print("-" * 80)
            status_for_log = 'success'
        except socket.timeout:
            print("\nWarning: No acknowledgment received within 5 seconds")
            status_for_log = 'failed'
        
    except ConnectionRefusedError:
        error_for_log = f"Connection refused {host}:{port}"
        print(f"Error: Connection refused. Make sure the HL7 server is running on {host}:{port}")
    except Exception as e:
        error_for_log = str(e)
        print(f"Error: {str(e)}")
    finally:
        try:
            sock.close()
        except Exception:
            pass

        # After sending, upsert a DB result for a chosen analysis and add a transfer log (best-effort)
        if selected_analysis and linked_request_id:
            try:
                # Generate a demo numeric result
                demo_value = round(random.uniform(1.0, 100.0), 2)
                _DB.upsert_result(
                    linked_request_id,
                    selected_analysis['id'],
                    str(demo_value),
                    unit=None,
                    reference=None
                    # Using default status 'PENDING' to require validation
                )
                print(f"[DB] Result upserted for analysis {selected_analysis['code']} on request {linked_request_id}: {demo_value} (PENDING VALIDATION)")
            except Exception as e:
                print(f"[DB] Failed to upsert result: {e}")

        try:
            duration_ms = int((time.time() - start_ts) * 1000)
            _DB.insert_transfer_log(automate_id, 'result', status_for_log, duration_ms, error_for_log)
            print(f"[DB] Transfer log inserted (status={status_for_log}, duration={duration_ms}ms)")
        except Exception as e:
            print(f"[DB] Failed to insert transfer log: {e}")

def simulate_continuous_sending(interval=30):
    """Simulate continuous sending of results with a specified interval"""
    print(f"Starting {AUTOMATE_CONFIG['name']} simulator...")
    print(f"Automate ID: {AUTOMATE_CONFIG['id']}")
    print(f"Type: {AUTOMATE_CONFIG['type']}")
    print(f"Manufacturer: {AUTOMATE_CONFIG['manufacturer']}")
    print(f"Protocol: {AUTOMATE_CONFIG['protocol']}")
    print(f"Target: {AUTOMATE_CONFIG['config']['ipAddress']}:{AUTOMATE_CONFIG['config']['port']}")
    print("\nAvailable test codes:")
    for test in TEST_CODES:
        print(f"- {test['code']}: {test['name']} ({test['unit']}, Range: {test['ref_range']})")
    
    try:
        while True:
            send_hl7_message()
            print(f"\nWaiting {interval} seconds before sending next message...")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nSimulator stopped by user")

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════╗
║         TEST-PYTHON Automate Simulator        ║
╚══════════════════════════════════════════════╝
    """)
    
    while True:
        print("\nOptions:")
        print("1. Send single message")
        print("2. Start continuous simulation")
        print("3. Create NEW request for NEW test patient and random test + result")
        print("4. Exit")
        
        choice = input("\nSelect an option (1-4): ")
        
        if choice == "1":
            send_hl7_message()
        elif choice == "2":
            interval = input("Enter interval between messages in seconds (default 30): ")
            try:
                interval = int(interval) if interval else 30
                simulate_continuous_sending(interval)
            except ValueError:
                print("Invalid interval. Using default 30 seconds.")
                simulate_continuous_sending(30)
        elif choice == "3":
            create_random_request_and_result()
        elif choice == "4":
            print("Exiting simulator...")
            break
        else:
            print("Invalid option. Please try again.")
