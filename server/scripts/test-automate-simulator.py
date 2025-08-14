import socket
import time
import random
from datetime import datetime

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

    try:
        # Create socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        print(f"Connecting to {host}:{port}...")
        sock.connect((host, port))
        print(f"Connected successfully to {host}:{port}")

        # Create and send message
        hl7 = HL7Message()
        request_id = f"REQ{datetime.now().strftime('%Y%m%d%H%M%S')}"
        message = hl7.create_result_message(request_id=request_id)
        
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
        except socket.timeout:
            print("\nWarning: No acknowledgment received within 5 seconds")
        
    except ConnectionRefusedError:
        print(f"Error: Connection refused. Make sure the HL7 server is running on {host}:{port}")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        sock.close()

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
        print("3. Exit")
        
        choice = input("\nSelect an option (1-3): ")
        
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
            print("Exiting simulator...")
            break
        else:
            print("Invalid option. Please try again.")
