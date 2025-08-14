export const logPrintEvent = (type: string, requestId: string, userId: string | undefined) => {
  try {
    const key = 'sil_lab_print_logs';
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    logs.push({ type, requestId, userId, timestamp: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (e) {
    // ignore
  }
};

export const printReceipt = (request: any, options: { amountPaid: number; paymentMethod: string }) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const patient = request.patient;
  const html = `
  <html>
    <head>
      <title>Patient Receipt - ${patient.firstName} ${patient.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        .row { margin: 6px 0; }
        .bold { font-weight: 600; }
        .amount { font-size: 20px; color: #064e3b; font-weight: 700; }
        .box { border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin-top: 12px; }
      </style>
    </head>
    <body>
      <h1>Receipt / Reçu</h1>
      <div class="row"><span class="bold">Patient:</span> ${patient.firstName} ${patient.lastName} (ID: ${patient.id})</div>
      <div class="row"><span class="bold">Request:</span> ${request.id}</div>
      <div class="row"><span class="bold">Date:</span> ${new Date(request.createdAt || Date.now()).toLocaleString()}</div>
      <div class="box">
        <div class="row"><span class="bold">Amount Paid:</span> <span class="amount">${options.amountPaid.toFixed(2)} dh</span></div>
        <div class="row"><span class="bold">Payment Method:</span> ${options.paymentMethod}</div>
      </div>
      <div class="row" style="margin-top:16px;">Lab: SIL Laboratory • Tel: +212-5-XX-XX-XX • Email: contact@sil-lab.ma</div>
    </body>
  </html>`;
  win.document.write(html);
  win.document.close();
  win.print();
  logPrintEvent('receipt', request.id, undefined);
};

export const printCollectionSheet = (request: any) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const patient = request.patient;
  const analyses = (request.requestAnalyses || []).map((ra: any) => ra.analysis);
  const html = `
  <html>
    <head>
      <title>Collection Sheet - ${patient.firstName} ${patient.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        ul { margin: 8px 0; padding-left: 20px; }
        .badge { display:inline-block; padding:2px 6px; border:1px solid #999; border-radius:4px; font-size:12px; }
      </style>
    </head>
    <body>
      <h1>Sample Collection Sheet</h1>
      <div>Patient: ${patient.firstName} ${patient.lastName} (ID: ${patient.id})</div>
      <div>Request: ${request.id}</div>
      <div>Date/Time: ${request.collectionDate ? new Date(request.collectionDate).toLocaleString() : new Date().toLocaleString()}</div>
      <div>Sample Type: <span class="badge">${request.sampleType || 'BLOOD'}</span> • Tube: <span class="badge">${request.tubeType || 'SERUM'}</span></div>
      <h2>Analyses</h2>
      <ul>
        ${analyses.map((a: any) => `<li>${a.code} - ${a.name}</li>`).join('')}
      </ul>
      ${request.notes ? `<div><strong>Notes:</strong> ${request.notes}</div>` : ''}
    </body>
  </html>`;
  win.document.write(html);
  win.document.close();
  win.print();
  logPrintEvent('collection_sheet', request.id, undefined);
};

export const printTubeLabels = (request: any) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const patient = request.patient;
  const labels = (request.requestAnalyses || []).map((ra: any) => {
    const a = ra.analysis;
    return `<div class="label">
      <div><strong>${request.id}</strong></div>
      <div>${patient.id}</div>
      <div>${a.code} • ${request.sampleType || 'S'}</div>
    </div>`;
  }).join('');
  const html = `
  <html>
    <head>
      <title>Tube Labels - ${patient.firstName} ${patient.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 12px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .label { border: 1px dashed #999; padding: 6px; border-radius: 6px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="grid">${labels}</div>
    </body>
  </html>`;
  win.document.write(html);
  win.document.close();
  win.print();
  logPrintEvent('labels', request.id, undefined);
};

export const printRoutingSlip = (request: any) => {
  const win = window.open('', '_blank');
  if (!win) return;
  const analyses = (request.requestAnalyses || []).map((ra: any) => ra.analysis);
  const sections: Record<string, any[]> = {};
  analyses.forEach(a => {
    const section = a.category || 'General';
    sections[section] = sections[section] || [];
    sections[section].push(a);
  });
  const html = `
  <html>
    <head>
      <title>Internal Routing Slip - ${request.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        h2 { font-size: 14px; margin-top: 12px; }
        ul { margin: 6px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Internal Routing Slip</h1>
      <div>Request: ${request.id}</div>
      ${Object.keys(sections).map(sec => `
        <h2>${sec}</h2>
        <ul>
          ${sections[sec].map(a => `<li>${a.code} - ${a.name}</li>`).join('')}
        </ul>
      `).join('')}
    </body>
  </html>`;
  win.document.write(html);
  win.document.close();
  win.print();
  logPrintEvent('routing_slip', request.id, undefined);
};