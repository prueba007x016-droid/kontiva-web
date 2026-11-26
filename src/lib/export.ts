export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function toCSV(rows: any[], columns: string[], filename = 'reporte.csv') {
  const escape = (v: any) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => escape(r[c])).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export async function toExcel(rows: any[], columns: string[], filename = 'reporte.xlsx') {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Reporte');
  ws.addRow(columns);
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
  for (const r of rows) ws.addRow(columns.map(c => r[c]));
  ws.columns = columns.map(c => ({ header: c, key: c, width: 18 }));
  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
}

export async function toPDF(rows: any[], columns: string[], filename = 'reporte.pdf', title = 'Reporte KONTIVA') {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, 22);
  (autoTable as any)(doc, {
    head: [columns],
    body: rows.map(r => columns.map(c => r[c])),
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 32, 96] },
  });
  doc.save(filename);
}


