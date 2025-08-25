#!/usr/bin/env python3
"""
This script fixes the test-automate-simulator.py script to ensure it correctly sets
the status to PENDING and doesn't set validatedAt or validatedBy.
"""

import os
import re

# Path to the test-automate-simulator.py script
script_path = os.path.join(os.path.dirname(__file__), 'test-automate-simulator.py')

# Read the script
with open(script_path, 'r') as f:
    content = f.read()

# Fix the upsert_result method
content = re.sub(
    r'def upsert_result\(self, request_id, analysis_id, value: str, unit: str = None, reference: str = None, status: str = \'.*?\'\):',
    "def upsert_result(self, request_id, analysis_id, value: str, unit: str = None, reference: str = None, status: str = 'PENDING'):",
    content
)

# Fix the INSERT statement for PENDING results
content = re.sub(
    r'INSERT INTO "Result" \("requestId","analysisId",value,unit,reference,status,"validatedAt","validatedBy","updatedAt"\)\\n\s*\'VALUES \(%s,%s,%s,%s,%s,%s,NULL,NULL,NOW\(\)\)',',
    'INSERT INTO "Result" ("requestId","analysisId",value,unit,reference,status,"updatedAt")\\n'
    '\'VALUES (%s,%s,%s,%s,%s,%s,NOW())',',
    content
)

# Fix the UPDATE statement for PENDING results
content = re.sub(
    r'UPDATE "Result" SET value=%s, unit=%s, reference=%s, status=%s, "validatedAt"=NULL, "validatedBy"=NULL, "updatedAt"=NOW\(\) WHERE id=%s',
    'UPDATE "Result" SET value=%s, unit=%s, reference=%s, status=%s, "validatedAt"=NULL, "validatedBy"=NULL, "updatedAt"=NOW() WHERE id=%s',
    content
)

# Write the fixed script
with open(script_path, 'w') as f:
    f.write(content)

print(f"Fixed {script_path}")