const l=(t,i,n)=>{try{const a="sil_lab_print_logs",o=JSON.parse(localStorage.getItem(a)||"[]");o.push({type:t,requestId:i,userId:n,timestamp:new Date().toISOString()}),localStorage.setItem(a,JSON.stringify(o))}catch{}},d=(t,i)=>{const n=window.open("","_blank");if(!n)return;const a=t.patient,o=`
  <html>
    <head>
      <title>Patient Receipt - ${a.firstName} ${a.lastName}</title>
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
      <div class="row"><span class="bold">Patient:</span> ${a.firstName} ${a.lastName} (ID: ${a.id})</div>
      <div class="row"><span class="bold">Request:</span> ${t.id}</div>
      <div class="row"><span class="bold">Date:</span> ${new Date(t.createdAt||Date.now()).toLocaleString()}</div>
      <div class="box">
        <div class="row"><span class="bold">Amount Paid:</span> <span class="amount">${i.amountPaid.toFixed(2)} dh</span></div>
        <div class="row"><span class="bold">Payment Method:</span> ${i.paymentMethod}</div>
      </div>
      <div class="row" style="margin-top:16px;">Lab: SIL Laboratory • Tel: +212-5-XX-XX-XX • Email: contact@sil-lab.ma</div>
    </body>
  </html>`;n.document.write(o),n.document.close(),n.print(),l("receipt",t.id,void 0)},p=t=>{const i=window.open("","_blank");if(!i)return;const n=t.patient,a=(t.requestAnalyses||[]).map(e=>e.analysis),o=`
  <html>
    <head>
      <title>Collection Sheet - ${n.firstName} ${n.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        ul { margin: 8px 0; padding-left: 20px; }
        .badge { display:inline-block; padding:2px 6px; border:1px solid #999; border-radius:4px; font-size:12px; }
      </style>
    </head>
    <body>
      <h1>Sample Collection Sheet</h1>
      <div>Patient: ${n.firstName} ${n.lastName} (ID: ${n.id})</div>
      <div>Request: ${t.id}</div>
      <div>Date/Time: ${t.collectionDate?new Date(t.collectionDate).toLocaleString():new Date().toLocaleString()}</div>
      <div>Sample Type: <span class="badge">${t.sampleType||"BLOOD"}</span> • Tube: <span class="badge">${t.tubeType||"SERUM"}</span></div>
      <h2>Analyses</h2>
      <ul>
        ${a.map(e=>`<li>${e.code} - ${e.name}</li>`).join("")}
      </ul>
      ${t.notes?`<div><strong>Notes:</strong> ${t.notes}</div>`:""}
    </body>
  </html>`;i.document.write(o),i.document.close(),i.print(),l("collection_sheet",t.id,void 0)},r=t=>{const i=window.open("","_blank");if(!i)return;const n=t.patient,a=(t.requestAnalyses||[]).map(e=>{const s=e.analysis;return`<div class="label">
      <div><strong>${t.id}</strong></div>
      <div>${n.id}</div>
      <div>${s.code} • ${t.sampleType||"S"}</div>
    </div>`}).join(""),o=`
  <html>
    <head>
      <title>Tube Labels - ${n.firstName} ${n.lastName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 12px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .label { border: 1px dashed #999; padding: 6px; border-radius: 6px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="grid">${a}</div>
    </body>
  </html>`;i.document.write(o),i.document.close(),i.print(),l("labels",t.id,void 0)},c=t=>{const i=window.open("","_blank");if(!i)return;const n=(t.requestAnalyses||[]).map(e=>e.analysis),a={};n.forEach(e=>{const s=e.category||"General";a[s]=a[s]||[],a[s].push(e)});const o=`
  <html>
    <head>
      <title>Internal Routing Slip - ${t.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        h2 { font-size: 14px; margin-top: 12px; }
        ul { margin: 6px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Internal Routing Slip</h1>
      <div>Request: ${t.id}</div>
      ${Object.keys(a).map(e=>`
        <h2>${e}</h2>
        <ul>
          ${a[e].map(s=>`<li>${s.code} - ${s.name}</li>`).join("")}
        </ul>
      `).join("")}
    </body>
  </html>`;i.document.write(o),i.document.close(),i.print(),l("routing_slip",t.id,void 0)};export{l as logPrintEvent,p as printCollectionSheet,d as printReceipt,c as printRoutingSlip,r as printTubeLabels};
