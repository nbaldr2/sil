import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFFromElement = async (element: HTMLElement, filename: string): Promise<string> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
    
    return filename;
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
};

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  cnssNumber?: string;
  gender: string;
}

interface Doctor {
  firstName: string;
  lastName: string;
  specialty?: string;
}

interface Result {
  id: string;
  value: string | null;
  unit: string | null;
  reference: string | null;
  status: string;
  notes: string | null;
  analysis: {
    id: string;
    name: string;
    code: string;
    category: string;
  };
}

interface Request {
  id: string;
  status: string;
  createdAt: string;
  patient: Patient;
  doctor?: Doctor;
  results?: Result[];
}

export const generateResultPDF = async (
  request: Request,
  language: 'fr' | 'en' = 'en'
) => {
  try {
    if (!request?.patient) throw new Error('Invalid request data');

    const t = {
      en: {
        labName: 'SIL Laboratory',
        labAddress: '123 Health Street, Casablanca, Morocco',
        labPhone: 'Phone: +212 5 22 123 456',
        labEmail: 'Email: contact@sil-lab.ma',
        reportTitle: 'COMPLETE BLOOD COUNT (CBC)',
        patientInfo: 'PATIENT INFORMATION',
        doctorInfo: 'PRESCRIBING DOCTOR',
        requestInfo: 'REQUEST DETAILS',
        analysisName: 'Test',
        result: 'Result',
        unit: 'Unit',
        reference: 'Ref. Range',
        status: 'Status',
        notes: 'Notes',
        normal: 'Normal',
        abnormal: 'Abnormal',
        pending: 'Pending',
        validated: 'Validated',
        reportDate: 'Report Date',
        interpretation: 'Interpretation',
        validatedBy: 'Validated by',
        signature: 'Signature',
        disclaimer:
          'This report is generated automatically by SIL Laboratory System and is intended for medical professionals.',
        noResults: 'No results available',
      },
      fr: {
        labName: 'Laboratoire SIL',
        labAddress: '123 Rue de la Santé, Casablanca, Maroc',
        labPhone: 'Tél: +212 5 22 123 456',
        labEmail: 'Email: contact@sil-lab.ma',
        reportTitle: 'NUMÉRATION FORMULE SANGUINE (NFS)',
        patientInfo: 'INFORMATIONS PATIENT',
        doctorInfo: 'MÉDECIN PRESCRIPTEUR',
        requestInfo: 'DÉTAILS DEMANDE',
        analysisName: 'Analyse',
        result: 'Résultat',
        unit: 'Unité',
        reference: 'Valeurs de réf.',
        status: 'Statut',
        notes: 'Notes',
        normal: 'Normal',
        abnormal: 'Anormal',
        pending: 'En attente',
        validated: 'Validé',
        reportDate: 'Date du rapport',
        interpretation: 'Interprétation',
        validatedBy: 'Validé par',
        signature: 'Signature',
        disclaimer:
          'Ce rapport est généré automatiquement par le système SIL et destiné aux professionnels de santé.',
        noResults: 'Aucun résultat disponible',
      },
    }[language];

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');

    const getStatusText = (status: string) => {
      switch (status) {
        case 'VALIDATED':
          return t.validated;
        case 'PENDING':
          return t.pending;
        default:
          return status;
      }
    };

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 14;
    let y = margin;

    // Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(t.labName, pageWidth / 2, y, { align: 'center' });
    y += 7;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(t.labAddress, pageWidth / 2, y, { align: 'center' });
    y += 5;
    pdf.text(t.labPhone, pageWidth / 2, y, { align: 'center' });
    y += 5;
    pdf.text(t.labEmail, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Report title
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(t.reportTitle, pageWidth / 2, y, { align: 'center' });
    y += 8;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Patient Info
    pdf.setFont('helvetica', 'bold');
    pdf.text(t.patientInfo, margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(
      `${request.patient.firstName} ${request.patient.lastName}`,
      margin,
      y
    );
    pdf.text(`${t.reportDate}: ${formatDate(new Date().toISOString())}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    pdf.text(`${t.analysisName}: CBC`, margin, y);
    pdf.text(`${t.patientInfo}: ${request.patient.gender}`, pageWidth - margin, y, { align: 'right' });
    y += 8;

    // Group results by category
    const grouped = request.results?.reduce((acc, res) => {
      const cat = res.analysis.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(res);
      return acc;
    }, {} as Record<string, Result[]>);

    if (grouped) {
      Object.entries(grouped).forEach(([category, results]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y - 4, pageWidth - margin * 2, 6, 'F');
        pdf.text(category, margin + 2, y);
        y += 6;

        // Table header
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const headers = [
          { text: t.analysisName, x: margin },
          { text: t.result, x: margin + 70 },
          { text: t.unit, x: margin + 100 },
          { text: t.reference, x: margin + 120 },
          { text: t.status, x: margin + 160 },
        ];
        headers.forEach((h) => pdf.text(h.text, h.x, y));
        y += 4;

        // Results
        pdf.setFont('helvetica', 'normal');
        results.forEach((r) => {
          if (y > 270) {
            pdf.addPage();
            y = margin;
          }
          if (r.status.toUpperCase() === 'ABNORMAL') {
            pdf.setTextColor(200, 0, 0);
          } else {
            pdf.setTextColor(0, 0, 0);
          }
          pdf.text(r.analysis.name, margin, y);
          pdf.text(r.value || '-', margin + 70, y);
          pdf.text(r.unit || '-', margin + 100, y);
          pdf.text(r.reference || '-', margin + 120, y);
          pdf.text(getStatusText(r.status), margin + 160, y);
          y += 4;
        });
        pdf.setTextColor(0, 0, 0);
        y += 3;
      });
    } else {
      pdf.setFontSize(10);
      pdf.text(t.noResults, margin, y);
      y += 5;
    }

    // Interpretation
    y += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text(t.interpretation, margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(
      'All parameters within normal limits unless indicated in red. Please consult a physician for further interpretation.',
      margin,
      y,
      { maxWidth: pageWidth - margin * 2 }
    );
    y += 10;

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(t.disclaimer, pageWidth / 2, 285, { align: 'center' });

    // Save
    const filename = `CBC_Report_${request.patient.firstName}_${request.patient.lastName}.pdf`;
    pdf.save(filename);
    return filename;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
