/**
 * ForensicExportService.js
 * Export forensic analysis reports in PDF, Excel, PowerPoint, and XML formats.
 * Uses: jspdf (PDF), pptxgenjs (PowerPoint), native XML/CSV string generation.
 * Files are saved via Tauri's dialog + fs plugins with fallback to browser download.
 */

import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

// ─── Helpers ───
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

/** Trigger browser download for a Blob */
const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/** Try Tauri save dialog, fall back to browser download */
const saveFile = async (uint8Array, defaultName, filters) => {
    try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeFile } = await import('@tauri-apps/plugin-fs');
        const path = await save({ defaultPath: defaultName, filters });
        if (path) {
            await writeFile(path, uint8Array);
            return path;
        }
        return null;
    } catch {
        // Not in Tauri — browser fallback
        const blob = new Blob([uint8Array]);
        downloadBlob(blob, defaultName);
        return defaultName;
    }
};

/** Convert an image URL (blob: or data:) to base64 data URI for jsPDF embedding */
const imageUrlToBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

/** Format a camelCase key into readable title */
const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

// ═══════════════════════════════════════════════════════════
//  PDF EXPORT — Comprehensive Forensic Report
// ═══════════════════════════════════════════════════════════
export const exportPDF = async (data) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();   // 210
    const H = doc.internal.pageSize.getHeight();  // 297
    const margin = 15;
    const usableW = W - margin * 2;
    let y = 20;

    // ── Helper: add text with word wrap and auto page-break ──
    const addText = (text, size = 10, style = 'normal', color = [40, 40, 50], indent = 0) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(String(text), usableW - indent);
        lines.forEach(line => {
            if (y > H - 20) { doc.addPage(); y = 20; }
            doc.text(line, margin + indent, y);
            y += size * 0.42 + 0.8;
        });
        y += 1;
    };

    const addSectionTitle = (title) => {
        y += 4;
        if (y > H - 40) { doc.addPage(); y = 20; }
        // Accent bar
        doc.setFillColor(75, 75, 165);
        doc.rect(margin, y - 4, 3, 7, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 55, 120);
        doc.text(title, margin + 6, y);
        y += 8;
        // Thin line
        doc.setDrawColor(200, 200, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, y - 3, W - margin, y - 3);
        y += 2;
    };

    const addKeyValue = (key, value, keyColor = [80, 80, 100], valColor = [40, 40, 50]) => {
        if (y > H - 20) { doc.addPage(); y = 20; }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...keyColor);
        doc.text(key + ':', margin + 4, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...valColor);
        const valLines = doc.splitTextToSize(String(value || 'N/A'), usableW - 60);
        doc.text(valLines, margin + 52, y);
        y += Math.max(valLines.length * 4, 5) + 1;
    };

    // ════════════════════════════════════════════════════════
    //  PAGE 1: COVER / HEADER
    // ════════════════════════════════════════════════════════
    // Dark header band
    doc.setFillColor(28, 28, 48);
    doc.rect(0, 0, W, 50, 'F');
    // Accent stripe
    doc.setFillColor(100, 80, 200);
    doc.rect(0, 50, W, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FORENSIC ANALYSIS REPORT', margin, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 210);
    doc.text('EdgePredict Forensic AI Model v2.0', margin, 32);

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 170);
    doc.text(`Report ID: ${data.reportId}`, margin, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 45);

    if (data.legalGrade) {
        doc.setFillColor(50, 180, 120);
        doc.roundedRect(W - margin - 35, 34, 35, 10, 2, 2, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('CERTIFIED', W - margin - 28, 40);
    }

    y = 62;

    // ── Report summary box ──
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(margin, y, usableW, 22, 2, 2, 'F');
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, usableW, 22, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 130);
    doc.text('DOCUMENT CLASSIFICATION', margin + 5, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 80);
    doc.text('This report contains a comprehensive forensic analysis of tool failure including visual evidence,', margin + 5, y + 11);
    doc.text('process parameters, material specifications, failure timeline, and compliance verification.', margin + 5, y + 16);
    y += 30;

    // ════════════════════════════════════════════════════════
    //  SECTION: UPLOADED SPECIMENS (IMAGES)
    // ════════════════════════════════════════════════════════
    const images = data.images || [];
    if (images.length > 0) {
        addSectionTitle('VISUAL EVIDENCE — Uploaded Specimens');
        addText(`Total specimens analyzed: ${images.length}`, 9, 'normal', [80, 80, 100]);

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (y > H - 80) { doc.addPage(); y = 20; }

            // Try to embed the actual image
            try {
                const base64 = await imageUrlToBase64(img.url);
                if (base64) {
                    const imgW = 70;
                    const imgH = 50;
                    doc.setDrawColor(180, 180, 200);
                    doc.setLineWidth(0.5);
                    doc.rect(margin, y, imgW + 2, imgH + 2, 'S');
                    doc.addImage(base64, 'JPEG', margin + 1, y + 1, imgW, imgH);

                    // Image info beside the image
                    const infoX = margin + imgW + 8;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 60);
                    doc.text(`Specimen ${i + 1}`, infoX, y + 8);

                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(80, 80, 100);
                    doc.text(`Filename: ${img.name}`, infoX, y + 16);
                    doc.text(`File size: ${img.size}`, infoX, y + 22);
                    doc.text(`Quality score: ${img.quality}%`, infoX, y + 28);

                    // Quality indicator bar
                    const barX = infoX;
                    const barY = y + 33;
                    const barW = 50;
                    doc.setFillColor(230, 230, 235);
                    doc.roundedRect(barX, barY, barW, 4, 1, 1, 'F');
                    const qColor = img.quality > 85 ? [50, 180, 100] : img.quality > 70 ? [200, 160, 50] : [200, 60, 60];
                    doc.setFillColor(...qColor);
                    doc.roundedRect(barX, barY, barW * (img.quality / 100), 4, 1, 1, 'F');

                    doc.setFontSize(7);
                    doc.setTextColor(...qColor);
                    doc.text(img.quality > 85 ? 'HIGH QUALITY' : img.quality > 70 ? 'ACCEPTABLE' : 'LOW QUALITY', barX, barY + 10);

                    y += imgH + 10;
                }
            } catch {
                addText(`Specimen ${i + 1}: ${img.name} (${img.size}) — Quality: ${img.quality}%`, 9, 'normal', [60, 60, 80], 4);
            }
        }
    }

    // ════════════════════════════════════════════════════════
    //  SECTION: PROCESS PARAMETERS
    // ════════════════════════════════════════════════════════
    const proc = data.processParams || {};
    const hasProcessData = Object.values(proc).some(v => v && String(v).trim() !== '');
    if (hasProcessData) {
        addSectionTitle('PROCESS PARAMETERS — Cutting Conditions');

        if (proc.cuttingSpeed) addKeyValue('Cutting Speed', `${proc.cuttingSpeed} m/min`);
        if (proc.feedRate) addKeyValue('Feed Rate', `${proc.feedRate} mm/rev`);
        if (proc.depthOfCut) addKeyValue('Depth of Cut', `${proc.depthOfCut} mm`);
        if (proc.coolantFlow) addKeyValue('Coolant Flow', `${proc.coolantFlow} L/min`);
        if (proc.spindleLoad) addKeyValue('Spindle Load', `${proc.spindleLoad}%`);
        if (proc.temperature) addKeyValue('Ambient Temperature', `${proc.temperature} C`);
        if (proc.humidity) addKeyValue('Humidity', `${proc.humidity}%`);
    }

    // ════════════════════════════════════════════════════════
    //  SECTION: MATERIAL SCIENCE
    // ════════════════════════════════════════════════════════
    const mat = data.materialParams || {};
    const hasMatData = Object.values(mat).some(v => v && String(v).trim() !== '');
    if (hasMatData) {
        addSectionTitle('MATERIAL SCIENCE — Tool & Workpiece');

        // Tool side
        addText('TOOL MATERIAL', 9, 'bold', [75, 75, 140], 2);
        if (mat.toolGrade) addKeyValue('Grade', mat.toolGrade);
        if (mat.coating) addKeyValue('Coating', mat.coating);
        if (mat.heatTreatment) addKeyValue('Heat Treatment', mat.heatTreatment);
        if (mat.supplier) addKeyValue('Supplier', mat.supplier);
        y += 2;

        // Workpiece side
        addText('WORKPIECE', 9, 'bold', [75, 75, 140], 2);
        if (mat.workpieceMaterial) addKeyValue('Material', mat.workpieceMaterial);
        if (mat.hardness) addKeyValue('Hardness', `${mat.hardness} HRC`);
        if (mat.batchNumber) addKeyValue('Batch Number', mat.batchNumber);
        if (mat.manufacturingDate) addKeyValue('Manufacturing Date', mat.manufacturingDate);
    }

    // ════════════════════════════════════════════════════════
    //  SECTION: FAILURE TIMELINE
    // ════════════════════════════════════════════════════════
    addSectionTitle('FAILURE TIMELINE — Event Sequence');

    data.timeline.forEach((ev, i) => {
        if (y > H - 25) { doc.addPage(); y = 20; }

        // Timeline dot
        const dotColor = ev.status === 'ok' ? [50, 180, 100] : ev.status === 'warning' ? [200, 160, 50] : [200, 60, 60];
        doc.setFillColor(...dotColor);
        doc.circle(margin + 5, y - 1, 2, 'F');

        // Connecting line
        if (i < data.timeline.length - 1) {
            doc.setDrawColor(200, 200, 220);
            doc.setLineWidth(0.3);
            doc.line(margin + 5, y + 1.5, margin + 5, y + 9);
        }

        // Time
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 130);
        doc.text(ev.time, margin + 12, y);

        // Status badge
        const badgeColors = { ok: [230, 250, 235], warning: [255, 245, 225], danger: [255, 235, 235] };
        const textColors = { ok: [30, 130, 70], warning: [150, 110, 20], danger: [180, 40, 40] };
        const bg = badgeColors[ev.status] || badgeColors.ok;
        const fg = textColors[ev.status] || textColors.ok;
        doc.setFillColor(...bg);
        doc.roundedRect(margin + 32, y - 3.5, 16, 5, 1, 1, 'F');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...fg);
        doc.text(ev.status.toUpperCase(), margin + 35, y);

        // Event text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 70);
        const eventLines = doc.splitTextToSize(ev.event, usableW - 55);
        doc.text(eventLines, margin + 52, y);
        y += Math.max(eventLines.length * 4.5, 6) + 4;
    });

    // ════════════════════════════════════════════════════════
    //  SECTION: MATERIAL ANALYSIS (AI Results)
    // ════════════════════════════════════════════════════════
    addSectionTitle('MATERIAL ANALYSIS — AI Findings');

    Object.entries(data.materialAnalysis).forEach(([key, val]) => {
        if (y > H - 30) { doc.addPage(); y = 20; }
        // Sub-heading
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 100);
        doc.text(formatKey(key).toUpperCase(), margin + 4, y);
        y += 5;

        // Content box
        const valLines = doc.splitTextToSize(String(val), usableW - 12);
        const boxH = valLines.length * 4.5 + 5;
        doc.setFillColor(248, 248, 252);
        doc.roundedRect(margin + 2, y - 4, usableW - 4, boxH, 1.5, 1.5, 'F');
        doc.setDrawColor(220, 220, 235);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin + 2, y - 4, usableW - 4, boxH, 1.5, 1.5, 'S');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 80);
        doc.text(valLines, margin + 6, y);
        y += boxH + 3;
    });

    // ════════════════════════════════════════════════════════
    //  SECTION: COMPLIANCE CHECK
    // ════════════════════════════════════════════════════════
    addSectionTitle('COMPLIANCE VERIFICATION');

    data.compliance.forEach(c => {
        if (y > H - 20) { doc.addPage(); y = 20; }

        // Status icon
        if (c.status) {
            doc.setFillColor(230, 250, 235);
            doc.roundedRect(margin + 2, y - 4, usableW - 4, 10, 1.5, 1.5, 'F');
            doc.setDrawColor(180, 230, 190);
        } else {
            doc.setFillColor(255, 235, 235);
            doc.roundedRect(margin + 2, y - 4, usableW - 4, 10, 1.5, 1.5, 'F');
            doc.setDrawColor(230, 180, 180);
        }
        doc.setLineWidth(0.3);
        doc.roundedRect(margin + 2, y - 4, usableW - 4, 10, 1.5, 1.5, 'S');

        // Pass/Fail badge
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(c.status ? 30 : 180, c.status ? 130 : 40, c.status ? 70 : 40);
        doc.text(c.status ? 'PASS' : 'FAIL', margin + 6, y);

        // Standard
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 60);
        doc.text(c.standard, margin + 22, y);

        // Note
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 100);
        doc.text(c.note, margin + 55, y);

        y += 14;
    });

    // ════════════════════════════════════════════════════════
    //  FOOTER on every page
    // ════════════════════════════════════════════════════════
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Bottom line
        doc.setDrawColor(200, 200, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, H - 12, W - margin, H - 12);
        // Footer text
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 170);
        doc.setFont('helvetica', 'normal');
        doc.text(`EdgePredict Forensic AI Model v2.0`, margin, H - 8);
        doc.text(`${data.reportId}`, W / 2, H - 8, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, W - margin, H - 8, { align: 'right' });
    }

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `Forensic_Report_${data.reportId}_${timestamp()}.pdf`;
    return saveFile(new Uint8Array(pdfBytes), fileName, [{ name: 'PDF', extensions: ['pdf'] }]);
};

// ═══════════════════════════════════════════════════════════
//  EXCEL EXPORT  (pure-browser CSV with UTF-8 BOM for Excel)
// ═══════════════════════════════════════════════════════════
const csvEscape = (val) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

const buildCsvSection = (title, headers, rows) => {
    const lines = [];
    lines.push(title);
    lines.push(headers.map(csvEscape).join(','));
    rows.forEach(row => lines.push(row.map(csvEscape).join(',')));
    lines.push('');
    return lines.join('\n');
};

export const exportExcel = async (data) => {
    const sections = [];
    const proc = data.processParams || {};
    const mat = data.materialParams || {};

    // Summary
    sections.push([
        'EdgePredict Forensic Analysis Report',
        `Report ID,${csvEscape(data.reportId)}`,
        `Generated,${csvEscape(new Date().toLocaleString())}`,
        `Legal Grade,${data.legalGrade ? 'Certified' : 'Standard'}`,
        ''
    ].join('\n'));

    // Images summary
    if (data.images && data.images.length > 0) {
        sections.push(buildCsvSection(
            '--- VISUAL EVIDENCE ---',
            ['Specimen', 'Filename', 'Size', 'Quality'],
            data.images.map((img, i) => [`Specimen ${i + 1}`, img.name, img.size, `${img.quality}%`])
        ));
    }

    // Process Parameters
    const procEntries = [
        ['Cutting Speed', proc.cuttingSpeed ? `${proc.cuttingSpeed} m/min` : ''],
        ['Feed Rate', proc.feedRate ? `${proc.feedRate} mm/rev` : ''],
        ['Depth of Cut', proc.depthOfCut ? `${proc.depthOfCut} mm` : ''],
        ['Coolant Flow', proc.coolantFlow ? `${proc.coolantFlow} L/min` : ''],
        ['Spindle Load', proc.spindleLoad ? `${proc.spindleLoad}%` : ''],
        ['Temperature', proc.temperature ? `${proc.temperature} C` : ''],
        ['Humidity', proc.humidity ? `${proc.humidity}%` : ''],
    ].filter(([, v]) => v);
    if (procEntries.length > 0) {
        sections.push(buildCsvSection('--- PROCESS PARAMETERS ---', ['Parameter', 'Value'], procEntries));
    }

    // Material Science
    const matEntries = [
        ['Tool Grade', mat.toolGrade], ['Coating', mat.coating], ['Heat Treatment', mat.heatTreatment],
        ['Supplier', mat.supplier], ['Workpiece Material', mat.workpieceMaterial],
        ['Hardness', mat.hardness ? `${mat.hardness} HRC` : ''],
        ['Batch Number', mat.batchNumber], ['Manufacturing Date', mat.manufacturingDate],
    ].filter(([, v]) => v);
    if (matEntries.length > 0) {
        sections.push(buildCsvSection('--- MATERIAL SCIENCE ---', ['Property', 'Value'], matEntries));
    }

    // Failure Timeline
    sections.push(buildCsvSection(
        '--- FAILURE TIMELINE ---',
        ['Time', 'Event', 'Status'],
        data.timeline.map(ev => [ev.time, ev.event, ev.status.toUpperCase()])
    ));

    // Material Analysis
    sections.push(buildCsvSection(
        '--- MATERIAL ANALYSIS (AI) ---',
        ['Property', 'Analysis'],
        Object.entries(data.materialAnalysis).map(([k, v]) => [formatKey(k), v])
    ));

    // Compliance
    sections.push(buildCsvSection(
        '--- COMPLIANCE CHECK ---',
        ['Standard', 'Status', 'Note'],
        data.compliance.map(c => [c.standard, c.status ? 'PASS' : 'FAIL', c.note])
    ));

    const csv = sections.join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csv);
    const combined = new Uint8Array(bom.length + csvBytes.length);
    combined.set(bom, 0);
    combined.set(csvBytes, bom.length);

    const fileName = `Forensic_Report_${data.reportId}_${timestamp()}.csv`;
    return saveFile(combined, fileName, [{ name: 'Excel CSV', extensions: ['csv'] }]);
};

// ═══════════════════════════════════════════════════════════
//  POWERPOINT EXPORT
// ═══════════════════════════════════════════════════════════
export const exportPowerPoint = async (data) => {
    const pptx = new PptxGenJS();
    pptx.author = 'EdgePredict Forensic AI';
    pptx.title = `Forensic Report ${data.reportId}`;
    const proc = data.processParams || {};
    const mat = data.materialParams || {};

    // ─ Slide 1: Title ─
    const s1 = pptx.addSlide();
    s1.background = { color: '1a1a2e' };
    s1.addText('FORENSIC ANALYSIS REPORT', { x: 0.8, y: 1.5, w: 8.5, fontSize: 28, color: 'FFFFFF', bold: true, fontFace: 'Arial' });
    s1.addText(`Report ID: ${data.reportId}`, { x: 0.8, y: 2.4, w: 8.5, fontSize: 14, color: 'AAAACC', fontFace: 'Arial' });
    s1.addText(`Generated: ${new Date().toLocaleString()}`, { x: 0.8, y: 2.9, w: 8.5, fontSize: 11, color: '888899', fontFace: 'Arial' });
    if (data.legalGrade) {
        s1.addText('CERTIFIED', { x: 7, y: 0.3, w: 2.5, fontSize: 12, color: '66DDAA', bold: true, align: 'right', fontFace: 'Arial' });
    }
    s1.addText('Powered by EdgePredict Forensic AI Model v2.0', { x: 0.8, y: 4.8, w: 8.5, fontSize: 9, color: '555566', fontFace: 'Arial' });

    // ─ Slide 2: Visual Evidence ─
    const images = data.images || [];
    if (images.length > 0) {
        const s2 = pptx.addSlide();
        s2.addText('VISUAL EVIDENCE', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
        for (let i = 0; i < Math.min(images.length, 4); i++) {
            try {
                const base64 = await imageUrlToBase64(images[i].url);
                if (base64) {
                    const col = i % 2;
                    const row = Math.floor(i / 2);
                    s2.addImage({
                        data: base64, x: 0.5 + col * 4.7, y: 1.0 + row * 2.7, w: 4.2, h: 2.4,
                    });
                    s2.addText(`${images[i].name} (Q:${images[i].quality}%)`, {
                        x: 0.5 + col * 4.7, y: 3.5 + row * 2.7, w: 4.2, fontSize: 7, color: '666666', fontFace: 'Arial',
                    });
                }
            } catch { /* skip image */ }
        }
    }

    // ─ Slide 3: Parameters ─
    const s3 = pptx.addSlide();
    s3.addText('PROCESS & MATERIAL', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
    const paramRows = [
        proc.cuttingSpeed && ['Cutting Speed', `${proc.cuttingSpeed} m/min`],
        proc.feedRate && ['Feed Rate', `${proc.feedRate} mm/rev`],
        proc.depthOfCut && ['Depth of Cut', `${proc.depthOfCut} mm`],
        proc.coolantFlow && ['Coolant Flow', `${proc.coolantFlow} L/min`],
        mat.toolGrade && ['Tool Grade', mat.toolGrade],
        mat.coating && ['Coating', mat.coating],
        mat.workpieceMaterial && ['Workpiece', mat.workpieceMaterial],
        mat.hardness && ['Hardness', `${mat.hardness} HRC`],
    ].filter(Boolean).map(([k, v]) => [
        { text: k, options: { fontSize: 10, fontFace: 'Arial', color: '555555' } },
        { text: v, options: { fontSize: 10, fontFace: 'Arial', color: '333333', bold: true } },
    ]);
    if (paramRows.length > 0) {
        s3.addTable(
            [[
                { text: 'Parameter', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } },
                { text: 'Value', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } },
            ], ...paramRows],
            { x: 0.5, y: 1.0, w: 9, colW: [3, 6], border: { type: 'solid', pt: 0.5, color: 'CCCCCC' }, rowH: 0.4 }
        );
    }

    // ─ Slide 4: Failure Timeline ─
    const s4 = pptx.addSlide();
    s4.addText('FAILURE TIMELINE', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
    const tlRows = data.timeline.map(ev => [
        { text: ev.time, options: { fontSize: 10, fontFace: 'Courier New', color: '555555' } },
        { text: ev.event, options: { fontSize: 10, fontFace: 'Arial', color: '333333' } },
        { text: ev.status.toUpperCase(), options: { fontSize: 10, fontFace: 'Arial', bold: true, color: ev.status === 'danger' ? 'CC3333' : ev.status === 'warning' ? 'CC9933' : '33AA66' } }
    ]);
    s4.addTable(
        [[
            { text: 'Time', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } },
            { text: 'Event', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } },
            { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } }
        ], ...tlRows],
        { x: 0.5, y: 1.0, w: 9, colW: [1.2, 6.3, 1.5], border: { type: 'solid', pt: 0.5, color: 'CCCCCC' }, rowH: 0.4 }
    );

    // ─ Slide 5: Material Analysis ─
    const s5 = pptx.addSlide();
    s5.addText('MATERIAL ANALYSIS', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
    let yPos = 1.2;
    Object.entries(data.materialAnalysis).forEach(([key, val]) => {
        s5.addText(formatKey(key).toUpperCase(), { x: 0.5, y: yPos, w: 9, fontSize: 12, color: '333355', bold: true, fontFace: 'Arial' });
        yPos += 0.35;
        s5.addText(val, { x: 0.5, y: yPos, w: 9, fontSize: 10, color: '555555', fontFace: 'Arial' });
        yPos += 0.55;
    });

    // ─ Slide 6: Compliance ─
    const s6 = pptx.addSlide();
    s6.addText('COMPLIANCE CHECK', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
    const compRows = data.compliance.map(c => [
        { text: c.standard, options: { fontSize: 10, fontFace: 'Arial', color: '333333' } },
        { text: c.status ? 'PASS' : 'FAIL', options: { fontSize: 10, fontFace: 'Arial', bold: true, color: c.status ? '33AA66' : 'CC3333' } },
        { text: c.note, options: { fontSize: 9, fontFace: 'Arial', color: '666666' } }
    ]);
    s6.addTable(
        [[
            { text: 'Standard', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } },
            { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } },
            { text: 'Note', options: { bold: true, color: 'FFFFFF', fill: { color: '333355' }, fontSize: 10, fontFace: 'Arial' } }
        ], ...compRows],
        { x: 0.5, y: 1.0, w: 9, colW: [2, 1.2, 5.8], border: { type: 'solid', pt: 0.5, color: 'CCCCCC' }, rowH: 0.45 }
    );

    const pptxBlob = await pptx.write({ outputType: 'arraybuffer' });
    const fileName = `Forensic_Report_${data.reportId}_${timestamp()}.pptx`;
    return saveFile(new Uint8Array(pptxBlob), fileName, [{ name: 'PowerPoint', extensions: ['pptx'] }]);
};

// ═══════════════════════════════════════════════════════════
//  XML EXPORT
// ═══════════════════════════════════════════════════════════
const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const exportXML = async (data) => {
    const proc = data.processParams || {};
    const mat = data.materialParams || {};
    const images = data.images || [];

    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<ForensicReport xmlns="urn:edgepredict:forensic:v2">',
        `  <ReportId>${esc(data.reportId)}</ReportId>`,
        `  <Generated>${new Date().toISOString()}</Generated>`,
        `  <LegalGrade>${data.legalGrade}</LegalGrade>`,
        '',
        '  <VisualEvidence>',
        ...images.map((img, i) =>
            `    <Specimen index="${i + 1}" filename="${esc(img.name)}" size="${esc(img.size)}" quality="${img.quality}" />`
        ),
        '  </VisualEvidence>',
        '',
        '  <ProcessParameters>',
        ...(proc.cuttingSpeed ? [`    <CuttingSpeed unit="m/min">${esc(proc.cuttingSpeed)}</CuttingSpeed>`] : []),
        ...(proc.feedRate ? [`    <FeedRate unit="mm/rev">${esc(proc.feedRate)}</FeedRate>`] : []),
        ...(proc.depthOfCut ? [`    <DepthOfCut unit="mm">${esc(proc.depthOfCut)}</DepthOfCut>`] : []),
        ...(proc.coolantFlow ? [`    <CoolantFlow unit="L/min">${esc(proc.coolantFlow)}</CoolantFlow>`] : []),
        ...(proc.spindleLoad ? [`    <SpindleLoad unit="%">${esc(proc.spindleLoad)}</SpindleLoad>`] : []),
        ...(proc.temperature ? [`    <Temperature unit="C">${esc(proc.temperature)}</Temperature>`] : []),
        ...(proc.humidity ? [`    <Humidity unit="%">${esc(proc.humidity)}</Humidity>`] : []),
        '  </ProcessParameters>',
        '',
        '  <MaterialScience>',
        ...(mat.toolGrade ? [`    <ToolGrade>${esc(mat.toolGrade)}</ToolGrade>`] : []),
        ...(mat.coating ? [`    <Coating>${esc(mat.coating)}</Coating>`] : []),
        ...(mat.heatTreatment ? [`    <HeatTreatment>${esc(mat.heatTreatment)}</HeatTreatment>`] : []),
        ...(mat.supplier ? [`    <Supplier>${esc(mat.supplier)}</Supplier>`] : []),
        ...(mat.workpieceMaterial ? [`    <WorkpieceMaterial>${esc(mat.workpieceMaterial)}</WorkpieceMaterial>`] : []),
        ...(mat.hardness ? [`    <Hardness unit="HRC">${esc(mat.hardness)}</Hardness>`] : []),
        ...(mat.batchNumber ? [`    <BatchNumber>${esc(mat.batchNumber)}</BatchNumber>`] : []),
        ...(mat.manufacturingDate ? [`    <ManufacturingDate>${esc(mat.manufacturingDate)}</ManufacturingDate>`] : []),
        '  </MaterialScience>',
        '',
        '  <FailureTimeline>',
        ...data.timeline.map(ev =>
            `    <Event time="${esc(ev.time)}" status="${esc(ev.status)}">${esc(ev.event)}</Event>`
        ),
        '  </FailureTimeline>',
        '',
        '  <MaterialAnalysis>',
        ...Object.entries(data.materialAnalysis).map(([k, v]) =>
            `    <${k}>${esc(v)}</${k}>`
        ),
        '  </MaterialAnalysis>',
        '',
        '  <ComplianceChecks>',
        ...data.compliance.map(c =>
            `    <Check standard="${esc(c.standard)}" status="${c.status ? 'PASS' : 'FAIL'}">${esc(c.note)}</Check>`
        ),
        '  </ComplianceChecks>',
        '',
        '</ForensicReport>'
    ];

    const xml = lines.join('\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(xml);
    const fileName = `Forensic_Report_${data.reportId}_${timestamp()}.xml`;
    return saveFile(bytes, fileName, [{ name: 'XML', extensions: ['xml'] }]);
};
