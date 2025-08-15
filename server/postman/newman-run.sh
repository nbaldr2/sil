#!/usr/bin/env bash
set -euo pipefail
# Local newman monitor runner
# Requires: npm i -g newman

COLLECTION="$(dirname "$0")/monitor.json"
ENVFILE="$(dirname "$0")/SIL-Lab.postman_environment.json"

# Allow overrides via env vars
: "${BASE_URL:=http://localhost:5001}"
: "${ADMIN_EMAIL:=admin@sil-lab.com}"
: "${ADMIN_PASSWORD:=admin123}"

# Create a temp env by merging runtime overrides
TMP_ENV=$(mktemp)
cat "$ENVFILE" | node -e '
const fs=require("fs");
const env=JSON.parse(fs.readFileSync(0,"utf8"));
const vals=env.values.reduce((m,v)=> (m[v.key]=v, m),{});
vals.base_url.value=process.env.BASE_URL||vals.base_url.value;
vals.admin_email.value=process.env.ADMIN_EMAIL||vals.admin_email.value;
vals.admin_password.value=process.env.ADMIN_PASSWORD||vals.admin_password.value;
env.values=Object.values(vals);
process.stdout.write(JSON.stringify(env));
' > "$TMP_ENV"

newman run "$COLLECTION" -e "$TMP_ENV" --reporters cli,htmlextra --reporter-htmlextra-export "$(pwd)/newman-report.html"

echo "Newman monitor finished. Report: $(pwd)/newman-report.html"