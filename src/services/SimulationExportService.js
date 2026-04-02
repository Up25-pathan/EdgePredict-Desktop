/**
 * SimulationExportService.js
 * Export simulation reports in PDF, Excel (CSV), PowerPoint, and XML formats.
 * Mirrors the design of ForensicExportService for consistent branding.
 * Uses: jspdf (PDF), pptxgenjs (PowerPoint), native CSV/XML string generation.
 */

import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

// ─── Helpers ───
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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
        const blob = new Blob([uint8Array]);
        downloadBlob(blob, defaultName);
        return defaultName;
    }
};

const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

// ═══════════════════════════════════════════════════════════
//  PDF EXPORT — Comprehensive Simulation Report
// ═══════════════════════════════════════════════════════════
export const exportSimulationPDF = async (sim) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 15;
    const usableW = W - margin * 2;
    let y = 20;

    // ── Helpers ──
    const checkPage = (need = 20) => { if (y > H - need) { doc.addPage(); y = 20; } };

    const addText = (text, size = 10, style = 'normal', color = [40, 40, 50], indent = 0) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(String(text), usableW - indent);
        lines.forEach(line => {
            checkPage();
            doc.text(line, margin + indent, y);
            y += size * 0.42 + 0.8;
        });
        y += 1;
    };

    const addSectionTitle = (title) => {
        y += 4;
        checkPage(40);
        doc.setFillColor(60, 80, 170);
        doc.rect(margin, y - 4, 3, 7, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 120);
        doc.text(title, margin + 6, y);
        y += 8;
        doc.setDrawColor(200, 200, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, y - 3, W - margin, y - 3);
        y += 2;
    };

    const addKeyValue = (key, value) => {
        checkPage();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 110);
        doc.text(key + ':', margin + 4, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 55);
        const valLines = doc.splitTextToSize(String(value || 'N/A'), usableW - 60);
        doc.text(valLines, margin + 52, y);
        y += Math.max(valLines.length * 4, 5) + 1;
    };

    // ════════════════════════════════════════════════════════
    //  COVER PAGE
    // ════════════════════════════════════════════════════════
    doc.setFillColor(22, 28, 50);
    doc.rect(0, 0, W, 55, 'F');
    doc.setFillColor(60, 100, 220);
    doc.rect(0, 55, W, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMULATION ANALYSIS REPORT', margin, 22);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 190, 240);
    doc.text(sim.name || 'Untitled Simulation', margin, 34);

    doc.setFontSize(8);
    doc.setTextColor(140, 150, 180);
    doc.text(`Simulation ID: ${sim.id}`, margin, 42);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 47);

    // Status badge
    const statusColor = sim.status === 'COMPLETED' ? [50, 180, 120] : sim.status === 'FAILED' ? [200, 60, 60] : [200, 160, 50];
    doc.setFillColor(...statusColor);
    doc.roundedRect(W - margin - 30, 38, 30, 10, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(sim.status || 'N/A', W - margin - 22, 44);

    y = 66;

    // Document summary box
    doc.setFillColor(245, 246, 252);
    doc.roundedRect(margin, y, usableW, 18, 2, 2, 'F');
    doc.setDrawColor(200, 205, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, usableW, 18, 2, 2, 'S');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 105, 135);
    doc.text('REPORT SUMMARY', margin + 5, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 85);
    const descText = sim.description || 'This report contains simulation analysis results including setup parameters, performance metrics, and threshold assessments.';
    const descLines = doc.splitTextToSize(descText, usableW - 10);
    doc.text(descLines, margin + 5, y + 11);
    y += 26;

    // Tags
    if (sim.tags && sim.tags.length > 0) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 105, 135);
        doc.text('TAGS:', margin + 4, y);
        const tagStr = Array.isArray(sim.tags) ? sim.tags.join(', ') : String(sim.tags);
        sim.tags.forEach && (() => {
            let tx = margin + 18;
            const tagList = Array.isArray(sim.tags) ? sim.tags : [sim.tags];
            tagList.forEach(tag => {
                const tw = doc.getTextWidth(String(tag)) + 6;
                doc.setFillColor(230, 235, 250);
                doc.roundedRect(tx, y - 3.5, tw, 6, 1.5, 1.5, 'F');
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(70, 80, 140);
                doc.text(String(tag), tx + 3, y);
                tx += tw + 3;
            });
        })();
        y += 10;
    }

    // ════════════════════════════════════════════════════════
    //  SECTION: SIMULATION SETUP PARAMETERS
    // ════════════════════════════════════════════════════════
    const setup = sim.setup || {};
    const hasSetup = Object.keys(setup).length > 0;
    if (hasSetup) {
        addSectionTitle('SIMULATION SETUP PARAMETERS');

        if (setup.machiningType) addKeyValue('Machining Type', setup.machiningType.toUpperCase());
        if (setup.rpm) addKeyValue('Spindle Speed (RPM)', `${setup.rpm} rev/min`);
        if (setup.feedRate) addKeyValue('Feed Rate', `${setup.feedRate} ${setup.machiningType === 'milling' ? 'mm/min' : 'mm/rev'}`);
        if (setup.depthOfCut) addKeyValue('Depth of Cut', `${setup.depthOfCut} mm`);
        if (setup.widthOfCut) addKeyValue('Width of Cut', `${setup.widthOfCut} mm`);

        y += 3;
        addText('TOOL CONFIGURATION', 9, 'bold', [70, 75, 140], 2);
        if (setup.toolMaterial) addKeyValue('Tool Material', setup.toolMaterial);
        if (setup.toolCoating) addKeyValue('Coating', setup.toolCoating);
        if (setup.toolGeometry) addKeyValue('Geometry File', setup.toolGeometry);

        y += 3;
        addText('WORKPIECE', 9, 'bold', [70, 75, 140], 2);
        if (setup.workpieceMaterial) addKeyValue('Material', setup.workpieceMaterial);
        if (setup.workpieceHardness) addKeyValue('Hardness', `${setup.workpieceHardness} HRC`);
        if (setup.workpieceDimensions) addKeyValue('Dimensions', setup.workpieceDimensions);

        y += 3;
        addText('COOLANT', 9, 'bold', [70, 75, 140], 2);
        if (setup.coolantType) addKeyValue('Type', setup.coolantType);
        if (setup.coolantVelocity) addKeyValue('Inlet Velocity', `${setup.coolantVelocity} m/s`);
        if (setup.coolantTemp) addKeyValue('Inlet Temperature', `${setup.coolantTemp} C`);
    }

    // ════════════════════════════════════════════════════════
    //  SECTION: KEY METRICS & RESULTS
    // ════════════════════════════════════════════════════════
    const results = sim.results || [];
    if (results.length > 0) {
        addSectionTitle('PERFORMANCE METRICS & THRESHOLD ANALYSIS');

        // Table header
        checkPage(30);
        const colWidths = [55, 30, 30, 25];
        const tableX = margin + 2;
        const tableW = colWidths.reduce((a, b) => a + b, 0);

        // Header row
        doc.setFillColor(35, 40, 65);
        doc.roundedRect(tableX, y - 4, tableW, 8, 1.5, 1.5, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        ['Metric', 'Value', 'Threshold', 'Status'].forEach((h, i) => {
            let cx = tableX + 3;
            for (let j = 0; j < i; j++) cx += colWidths[j];
            doc.text(h, cx, y);
        });
        y += 8;

        // Data rows
        results.forEach((r, idx) => {
            checkPage(12);
            const rowY = y - 3;
            const isOk = r.status === 'OK';

            // Alternating row bg
            if (idx % 2 === 0) {
                doc.setFillColor(248, 249, 252);
                doc.rect(tableX, rowY, tableW, 8, 'F');
            }

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(40, 40, 55);

            let cx = tableX + 3;
            doc.text(r.metric, cx, y);
            cx += colWidths[0];

            doc.setFont('helvetica', 'bold');
            doc.text(r.value, cx, y);
            cx += colWidths[1];

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 120);
            doc.text(r.threshold || '-', cx, y);
            cx += colWidths[2];

            // Status badge
            const badgeBg = isOk ? [230, 250, 235] : [255, 240, 225];
            const badgeFg = isOk ? [30, 130, 70] : [180, 110, 20];
            doc.setFillColor(...badgeBg);
            doc.roundedRect(cx - 1, rowY + 1.5, 18, 5, 1, 1, 'F');
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...badgeFg);
            doc.text(r.status, cx + 3, y);

            y += 9;
        });

        y += 5;

        // Summary statistics
        const okCount = results.filter(r => r.status === 'OK').length;
        const warnCount = results.filter(r => r.status === 'WARNING').length;
        const failCount = results.filter(r => r.status === 'FAIL' || r.status === 'CRITICAL').length;

        checkPage(25);
        doc.setFillColor(245, 246, 252);
        doc.roundedRect(margin + 2, y, usableW - 4, 18, 2, 2, 'F');
        doc.setDrawColor(210, 215, 230);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin + 2, y, usableW - 4, 18, 2, 2, 'S');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 105, 135);
        doc.text('ASSESSMENT SUMMARY', margin + 6, y + 5);

        doc.setFontSize(9);
        const summaryY = y + 13;

        doc.setTextColor(30, 130, 70);
        doc.text(`${okCount} PASSED`, margin + 6, summaryY);

        doc.setTextColor(180, 110, 20);
        doc.text(`${warnCount} WARNING`, margin + 45, summaryY);

        doc.setTextColor(200, 50, 50);
        doc.text(`${failCount} FAILED`, margin + 90, summaryY);

        y += 25;
    }

    // ════════════════════════════════════════════════════════
    //  SECTION: ANALYSIS NOTES
    // ════════════════════════════════════════════════════════
    if (sim.description) {
        addSectionTitle('ANALYSIS NOTES');
        addText(sim.description, 9, 'normal', [50, 50, 70], 4);
    }

    // ════════════════════════════════════════════════════════
    //  FOOTER on every page
    // ════════════════════════════════════════════════════════
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 205, 225);
        doc.setLineWidth(0.3);
        doc.line(margin, H - 12, W - margin, H - 12);
        doc.setFontSize(6);
        doc.setTextColor(150, 155, 175);
        doc.setFont('helvetica', 'normal');
        doc.text('EdgePredict Simulation Engine', margin, H - 8);
        doc.text(`SIM-${sim.id}`, W / 2, H - 8, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, W - margin, H - 8, { align: 'right' });
    }

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `Simulation_Report_${sim.id}_${timestamp()}.pdf`;
    return saveFile(new Uint8Array(pdfBytes), fileName, [{ name: 'PDF', extensions: ['pdf'] }]);
};

// ═══════════════════════════════════════════════════════════
//  EXCEL (CSV) EXPORT
// ═══════════════════════════════════════════════════════════
const csvEscape = (val) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
};

const buildCsvSection = (title, headers, rows) => {
    const lines = [title, headers.map(csvEscape).join(',')];
    rows.forEach(row => lines.push(row.map(csvEscape).join(',')));
    lines.push('');
    return lines.join('\n');
};

export const exportSimulationExcel = async (sim) => {
    const setup = sim.setup || {};
    const sections = [];

    // Summary
    sections.push([
        'EdgePredict Simulation Report',
        `Simulation ID,${csvEscape(sim.id)}`,
        `Name,${csvEscape(sim.name)}`,
        `Status,${csvEscape(sim.status)}`,
        `Generated,${csvEscape(new Date().toLocaleString())}`,
        `Description,${csvEscape(sim.description || '')}`,
        `Tags,${csvEscape(Array.isArray(sim.tags) ? sim.tags.join('; ') : sim.tags || '')}`,
        ''
    ].join('\n'));

    // Setup Parameters
    const setupEntries = [
        setup.machiningType && ['Machining Type', setup.machiningType],
        setup.rpm && ['RPM', setup.rpm],
        setup.feedRate && ['Feed Rate', setup.feedRate],
        setup.depthOfCut && ['Depth of Cut (mm)', setup.depthOfCut],
        setup.widthOfCut && ['Width of Cut (mm)', setup.widthOfCut],
        setup.toolMaterial && ['Tool Material', setup.toolMaterial],
        setup.toolCoating && ['Tool Coating', setup.toolCoating],
        setup.workpieceMaterial && ['Workpiece Material', setup.workpieceMaterial],
        setup.workpieceHardness && ['Workpiece Hardness (HRC)', setup.workpieceHardness],
        setup.coolantType && ['Coolant Type', setup.coolantType],
        setup.coolantVelocity && ['Coolant Velocity (m/s)', setup.coolantVelocity],
        setup.coolantTemp && ['Coolant Temp (C)', setup.coolantTemp],
    ].filter(Boolean);

    if (setupEntries.length > 0) {
        sections.push(buildCsvSection('--- SETUP PARAMETERS ---', ['Parameter', 'Value'], setupEntries));
    }

    // Results
    if (sim.results && sim.results.length > 0) {
        sections.push(buildCsvSection(
            '--- PERFORMANCE METRICS ---',
            ['Metric', 'Value', 'Threshold', 'Status'],
            sim.results.map(r => [r.metric, r.value, r.threshold || '', r.status])
        ));
    }

    const csv = sections.join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csv);
    const combined = new Uint8Array(bom.length + csvBytes.length);
    combined.set(bom, 0);
    combined.set(csvBytes, bom.length);

    const fileName = `Simulation_Report_${sim.id}_${timestamp()}.csv`;
    return saveFile(combined, fileName, [{ name: 'Excel CSV', extensions: ['csv'] }]);
};

// ═══════════════════════════════════════════════════════════
//  POWERPOINT EXPORT
// ═══════════════════════════════════════════════════════════
export const exportSimulationPowerPoint = async (sim) => {
    const pptx = new PptxGenJS();
    pptx.author = 'EdgePredict Engine';
    pptx.title = `Simulation Report ${sim.id}`;
    const setup = sim.setup || {};

    // ─ Slide 1: Title ─
    const s1 = pptx.addSlide();
    s1.background = { color: '161c32' };
    s1.addText('SIMULATION ANALYSIS REPORT', { x: 0.8, y: 1.2, w: 8.5, fontSize: 28, color: 'FFFFFF', bold: true, fontFace: 'Arial' });
    s1.addText(sim.name || 'Untitled Simulation', { x: 0.8, y: 2.2, w: 8.5, fontSize: 16, color: 'AABBEE', fontFace: 'Arial' });
    s1.addText(`Simulation ID: ${sim.id}`, { x: 0.8, y: 3.0, w: 8.5, fontSize: 11, color: '8899BB', fontFace: 'Arial' });
    s1.addText(`Generated: ${new Date().toLocaleString()}`, { x: 0.8, y: 3.4, w: 8.5, fontSize: 11, color: '8899BB', fontFace: 'Arial' });

    const statusColor = sim.status === 'COMPLETED' ? '55CC88' : sim.status === 'FAILED' ? 'CC4444' : 'CCAA44';
    s1.addText(sim.status || 'N/A', { x: 7, y: 0.3, w: 2.5, fontSize: 12, color: statusColor, bold: true, align: 'right', fontFace: 'Arial' });
    s1.addText('Powered by EdgePredict Simulation Engine', { x: 0.8, y: 4.8, w: 8.5, fontSize: 9, color: '555577', fontFace: 'Arial' });

    // ─ Slide 2: Setup Parameters ─
    const paramRows = [
        setup.machiningType && ['Machining Type', setup.machiningType.toUpperCase()],
        setup.rpm && ['Spindle Speed', `${setup.rpm} RPM`],
        setup.feedRate && ['Feed Rate', `${setup.feedRate}`],
        setup.depthOfCut && ['Depth of Cut', `${setup.depthOfCut} mm`],
        setup.toolMaterial && ['Tool Material', setup.toolMaterial],
        setup.toolCoating && ['Coating', setup.toolCoating],
        setup.workpieceMaterial && ['Workpiece', setup.workpieceMaterial],
        setup.coolantType && ['Coolant', setup.coolantType],
    ].filter(Boolean);

    if (paramRows.length > 0) {
        const s2 = pptx.addSlide();
        s2.addText('SETUP PARAMETERS', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
        const tblRows = paramRows.map(([k, v]) => [
            { text: k, options: { fontSize: 10, fontFace: 'Arial', color: '555555' } },
            { text: v, options: { fontSize: 10, fontFace: 'Arial', color: '333333', bold: true } },
        ]);
        s2.addTable(
            [[
                { text: 'Parameter', options: { bold: true, color: 'FFFFFF', fill: { color: '2a3060' }, fontSize: 10, fontFace: 'Arial' } },
                { text: 'Value', options: { bold: true, color: 'FFFFFF', fill: { color: '2a3060' }, fontSize: 10, fontFace: 'Arial' } },
            ], ...tblRows],
            { x: 0.5, y: 1.0, w: 9, colW: [3.5, 5.5], border: { type: 'solid', pt: 0.5, color: 'CCCCCC' }, rowH: 0.4 }
        );
    }

    // ─ Slide 3: Results Metrics ─
    if (sim.results && sim.results.length > 0) {
        const s3 = pptx.addSlide();
        s3.addText('PERFORMANCE METRICS', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
        const resRows = sim.results.map(r => [
            { text: r.metric, options: { fontSize: 10, fontFace: 'Arial', color: '333333' } },
            { text: r.value, options: { fontSize: 10, fontFace: 'Arial', color: '222244', bold: true } },
            { text: r.threshold || '-', options: { fontSize: 10, fontFace: 'Arial', color: '777777' } },
            { text: r.status, options: { fontSize: 10, fontFace: 'Arial', bold: true, color: r.status === 'OK' ? '33AA66' : r.status === 'WARNING' ? 'CC9933' : 'CC3333' } },
        ]);
        s3.addTable(
            [[
                { text: 'Metric', options: { bold: true, color: 'FFFFFF', fill: { color: '2a3060' }, fontSize: 10, fontFace: 'Arial' } },
                { text: 'Value', options: { bold: true, color: 'FFFFFF', fill: { color: '2a3060' }, fontSize: 10, fontFace: 'Arial' } },
                { text: 'Threshold', options: { bold: true, color: 'FFFFFF', fill: { color: '2a3060' }, fontSize: 10, fontFace: 'Arial' } },
                { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: '2a3060' }, fontSize: 10, fontFace: 'Arial' } },
            ], ...resRows],
            { x: 0.5, y: 1.0, w: 9, colW: [3, 2, 2, 2], border: { type: 'solid', pt: 0.5, color: 'CCCCCC' }, rowH: 0.45 }
        );
    }

    // ─ Slide 4: Notes ─
    if (sim.description) {
        const s4 = pptx.addSlide();
        s4.addText('ANALYSIS NOTES', { x: 0.5, y: 0.3, w: 9, fontSize: 20, color: '333355', bold: true, fontFace: 'Arial' });
        s4.addText(sim.description, { x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 12, color: '444455', fontFace: 'Arial', valign: 'top' });
    }

    const pptxBlob = await pptx.write({ outputType: 'arraybuffer' });
    const fileName = `Simulation_Report_${sim.id}_${timestamp()}.pptx`;
    return saveFile(new Uint8Array(pptxBlob), fileName, [{ name: 'PowerPoint', extensions: ['pptx'] }]);
};

// ═══════════════════════════════════════════════════════════
//  XML EXPORT
// ═══════════════════════════════════════════════════════════
const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const exportSimulationXML = async (sim) => {
    const setup = sim.setup || {};
    const results = sim.results || [];
    const tagStr = Array.isArray(sim.tags) ? sim.tags.join(', ') : (sim.tags || '');

    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<SimulationReport xmlns="urn:edgepredict:simulation:v2">',
        `  <SimulationId>${esc(sim.id)}</SimulationId>`,
        `  <Name>${esc(sim.name || '')}</Name>`,
        `  <Status>${esc(sim.status || '')}</Status>`,
        `  <Generated>${new Date().toISOString()}</Generated>`,
        `  <Description>${esc(sim.description || '')}</Description>`,
        `  <Tags>${esc(tagStr)}</Tags>`,
        '',
        '  <SetupParameters>',
        ...(setup.machiningType ? [`    <MachiningType>${esc(setup.machiningType)}</MachiningType>`] : []),
        ...(setup.rpm ? [`    <SpindleSpeed unit="RPM">${esc(setup.rpm)}</SpindleSpeed>`] : []),
        ...(setup.feedRate ? [`    <FeedRate>${esc(setup.feedRate)}</FeedRate>`] : []),
        ...(setup.depthOfCut ? [`    <DepthOfCut unit="mm">${esc(setup.depthOfCut)}</DepthOfCut>`] : []),
        ...(setup.widthOfCut ? [`    <WidthOfCut unit="mm">${esc(setup.widthOfCut)}</WidthOfCut>`] : []),
        ...(setup.toolMaterial ? [`    <ToolMaterial>${esc(setup.toolMaterial)}</ToolMaterial>`] : []),
        ...(setup.toolCoating ? [`    <ToolCoating>${esc(setup.toolCoating)}</ToolCoating>`] : []),
        ...(setup.workpieceMaterial ? [`    <WorkpieceMaterial>${esc(setup.workpieceMaterial)}</WorkpieceMaterial>`] : []),
        ...(setup.workpieceHardness ? [`    <WorkpieceHardness unit="HRC">${esc(setup.workpieceHardness)}</WorkpieceHardness>`] : []),
        ...(setup.coolantType ? [`    <CoolantType>${esc(setup.coolantType)}</CoolantType>`] : []),
        ...(setup.coolantVelocity ? [`    <CoolantVelocity unit="m/s">${esc(setup.coolantVelocity)}</CoolantVelocity>`] : []),
        ...(setup.coolantTemp ? [`    <CoolantTemperature unit="C">${esc(setup.coolantTemp)}</CoolantTemperature>`] : []),
        '  </SetupParameters>',
        '',
        '  <PerformanceMetrics>',
        ...results.map(r =>
            `    <Metric name="${esc(r.metric)}" value="${esc(r.value)}" threshold="${esc(r.threshold || '')}" status="${esc(r.status)}" />`
        ),
        '  </PerformanceMetrics>',
        '',
        '</SimulationReport>'
    ];

    const xml = lines.join('\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(xml);
    const fileName = `Simulation_Report_${sim.id}_${timestamp()}.xml`;
    return saveFile(bytes, fileName, [{ name: 'XML', extensions: ['xml'] }]);
};
