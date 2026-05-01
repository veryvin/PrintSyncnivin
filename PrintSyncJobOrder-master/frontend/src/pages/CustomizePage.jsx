import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

const DEPOSIT_AMOUNT = 500;
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// ── Fabric Types ───────────────────────────────────────────────────────────────
const FABRIC_TYPES = [
  { id: 'AIRCOOL', name: 'Aircool', desc: 'Lightweight airflow mesh' },
  { id: 'DURAMAX', name: 'Duramax', desc: 'Heavy-duty durability fabric' },
  { id: 'ECOFAB', name: 'Ecofab', desc: 'Eco-friendly performance fabric' },
  { id: 'ECOSOFT', name: 'Ecosoft', desc: 'Soft eco-conscious material' },
  { id: 'FULLMAX', name: 'Fullmax', desc: 'Full-coverage max protection' },
  { id: 'HEXA TEX', name: 'Hexa Tex', desc: 'Hexagonal texture weave' },
  { id: 'LYTEX', name: 'Lytex', desc: 'Ultra-light performance tex' },
  { id: 'MICRO-COOL', name: 'Micro-Cool', desc: 'Cooling micro-fiber blend' },
  { id: 'MICRO DEX', name: 'Micro Dex', desc: 'Flexible micro-dex weave' },
  { id: 'MICRO DOT', name: 'Micro Dot', desc: 'Dotted micro-texture finish' },
  { id: 'MICRO KNIT', name: 'Micro Knit', desc: 'Knitted micro-fiber fabric' },
  { id: 'MICRO SHINY', name: 'Micro Shiny', desc: 'Shiny micro-fiber sheen' },
  { id: 'MICROTECH COMPRESSION', name: 'Microtech Compression', desc: 'Compression tech fabric' },
  { id: 'POLYDEX', name: 'Polydex', desc: 'Polyester dex performance' },
  { id: 'POLTYDEX AG', name: 'Poltydex AG', desc: 'Anti-germ poly fabric' },
  { id: 'POLY LITE', name: 'Poly Lite', desc: 'Lightweight polyester blend' },
  { id: 'POLYMAX', name: 'Polymax', desc: 'Maximum poly performance' },
  { id: 'POLYTECH', name: 'Polytech', desc: 'Technical polyester weave' },
  { id: 'POLYSTRIPES', name: 'Polystripes', desc: 'Striped poly pattern fabric' },
  { id: 'RIBSTOPS', name: 'Ribstops', desc: 'Ribbed ripstop material' },
  { id: 'POLIFIT CROSS', name: 'Polifit Cross', desc: 'Cross-fit poly flex' },
  { id: 'SEMI COOL', name: 'Semi Cool', desc: 'Semi-cooling mid-weight' },
  { id: 'SEMI STEP', name: 'Semi Step', desc: 'Step-weave semi fabric' },
  { id: 'SOLAR M', name: 'Solar M', desc: 'Solar-reflective material' },
  { id: 'SPANDEX', name: 'Spandex', desc: 'High-stretch spandex blend' },
  { id: 'SPORTS MAX', name: 'Sports Max', desc: 'Max-performance sports fabric' },
  { id: 'SPUNDY', name: 'Spundy', desc: 'Spun-yarn durable weave' },
  { id: 'SQUARE KNIT', name: 'Square Knit', desc: 'Square-pattern knit texture' },
  { id: 'SUBLIDEX', name: 'Sublidex', desc: 'Sublimation-ready dex fabric' },
  { id: 'SUBLI DOT', name: 'Subli Dot', desc: 'Dot-pattern sublimation fabric' },
  { id: 'TRIFIT COTTON', name: 'Trifit Cotton', desc: 'Triple-blend cotton comfort' },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const FabricIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ShirtIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// ── JOB ORDER PDF GENERATOR (browser-side, no backend needed) ─────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Dynamically loads jsPDF from CDN (only once), then generates and
 * downloads a printable job order PDF that mirrors the physical sheet
 * in the photo: team name header, apparel/fabric row, player lineup
 * table with pink-highlighted oversized sizes, jersey color swatches,
 * layout notes, pricing summary, and production sign-off bar.
 */
const loadJsPDF = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
};

/**
 * Draws a simplified jersey silhouette on the jsPDF canvas.
 * @param {object} doc  - jsPDF instance
 * @param {number} x    - left edge in mm
 * @param {number} y    - top edge in mm
 * @param {number} w    - width in mm
 * @param {number} h    - height in mm
 * @param {string} primary  - hex color
 * @param {string} accent   - hex color
 * @param {string} label    - text on chest (team name or "SURNAME")
 * @param {string} number   - jersey number string
 * @param {boolean} isBack
 */
const drawJerseyOnPDF = (doc, x, y, w, h, primary, accent, label, number, isBack = false) => {
  const pr = hexToRgb(primary);
  const ac = hexToRgb(accent);

  // Scale helpers — base design space is 100×120 units
  const sx = w / 100;
  const sy = h / 120;
  const px = (u) => x + u * sx;
  const py = (u) => y + u * sy;

  // ── Body ──
  doc.setFillColor(...pr);
  doc.setDrawColor(...ac);
  doc.setLineWidth(0.4);
  doc.roundedRect(px(25), py(28), px(50) - px(25), py(100) - py(28), 1, 1, 'FD');

  // ── Left sleeve ──
  doc.setFillColor(...pr);
  doc.triangle(px(25), py(28), px(5), py(20), px(8), py(50), 'FD');

  // ── Right sleeve ──
  doc.triangle(px(75), py(28), px(95), py(20), px(92), py(50), 'FD');

  // ── Collar ──
  doc.setFillColor(...ac);
  doc.setDrawColor(...ac);
  if (!isBack) {
    // V-neck front
    doc.triangle(px(38), py(28), px(62), py(28), px(50), py(38), 'F');
  } else {
    // Round back collar
    doc.ellipse(px(50), py(28), px(14) - px(0), py(5) - py(0), 'F');
  }

  // ── Side accent stripes ──
  doc.setFillColor(...ac);
  doc.setGState(doc.GState({ opacity: 0.45 }));
  doc.rect(px(25), py(42), px(4.5) - px(0), py(58) - py(0), 'F');
  doc.rect(px(70.5), py(42), px(4.5) - px(0), py(58) - py(0), 'F');
  doc.setGState(doc.GState({ opacity: 1 }));

  // ── Bottom hem accent ──
  doc.setFillColor(...ac);
  doc.setGState(doc.GState({ opacity: 0.5 }));
  doc.rect(px(25), py(97), px(50) - px(25), py(3) - py(0), 'F');
  doc.setGState(doc.GState({ opacity: 1 }));

  // ── Jersey number ──
  doc.setTextColor(...ac);
  doc.setFont('helvetica', 'bold');
  const numSize = Math.round(22 * sx);
  doc.setFontSize(numSize);
  doc.text(number || '00', px(50), py(85), { align: 'center' });

  // ── Label text (team name or SURNAME) ──
  const lblSize = Math.round(6 * sx);
  doc.setFontSize(Math.max(5, lblSize));
  if (isBack) {
    doc.text((label || 'SURNAME').toUpperCase(), px(50), py(56), { align: 'center' });
  } else {
    doc.text((label || 'TEAM').toUpperCase(), px(50), py(60), { align: 'center' });
  }
};

/**
 * Main PDF generation function.
 * Call this after order is placed, passing the full order state.
 */
const generateJobOrderPDF = async ({
  orderId,
  teamName,
  selectedProduct,
  fabricType,
  primaryColor,
  accentColor,
  color1, color2, color3,
  customText,
  jerseyNumber,
  fontFamily,
  jerseyLayoutComments,
  logoPreview,
  quantity,
  filledLineup,
  phoneNumber,
  orderType,
  customerName,
  totalPrice,
  orderDate,
  deadline,
}) => {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = 210; // A4 width mm
  const PH = 297; // A4 height mm
  const M = 14;   // margin

  // ── HEADER BAR ──────────────────────────────────────────────────────────────
  doc.setFillColor(220, 50, 30);
  doc.rect(0, 0, PW, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${(teamName || customText || 'TEAM').toUpperCase()} — JOB ORDER`, PW / 2, 10, { align: 'center' });

  doc.setFontSize(8);
  const apparelLabel = `${selectedProduct?.name?.toUpperCase() || 'APPAREL'}  •  ${fabricType?.name?.toUpperCase() || ''}`;
  doc.text(apparelLabel, PW / 2, 17, { align: 'center' });

  // ── META STRIP ──────────────────────────────────────────────────────────────
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 22, PW, 10, 'F');

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`ORDER: ${orderId || '—'}`, M, 28.5);
  doc.text(`DATE: ${orderDate || new Date().toLocaleDateString('en-PH')}`, PW / 2, 28.5, { align: 'center' });
  doc.text(`DEADLINE: ${deadline || '—'}`, PW - M, 28.5, { align: 'right' });

  // ── SECTION: COLOR SWATCHES + ORDER INFO ────────────────────────────────────
  let curY = 37;

  // Color swatches row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text('PRIMARY COLOR', M, curY);
  doc.text('ACCENT COLOR', M + 38, curY);
  doc.text('ADD. COLORS', M + 76, curY);

  curY += 2;
  // Primary swatch
  const pr = hexToRgb(primaryColor || '#ffffff');
  doc.setFillColor(...pr);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, curY, 28, 7, 1, 1, 'FD');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text((primaryColor || '#ffffff').toUpperCase(), M + 1, curY + 10);

  // Accent swatch
  const ac = hexToRgb(accentColor || '#000000');
  doc.setFillColor(...ac);
  doc.roundedRect(M + 38, curY, 28, 7, 1, 1, 'FD');
  doc.text((accentColor || '#000000').toUpperCase(), M + 39, curY + 10);

  // Additional color dots
  [[color1, 0], [color2, 9], [color3, 18]].forEach(([col, offset]) => {
    if (col && col !== '#ffffff') {
      doc.setFillColor(...hexToRgb(col));
      doc.setDrawColor(180, 180, 180);
      doc.circle(M + 79 + offset, curY + 3.5, 3.5, 'FD');
    } else {
      doc.setFillColor(235, 235, 235);
      doc.setDrawColor(180, 180, 180);
      doc.circle(M + 79 + offset, curY + 3.5, 3.5, 'FD');
    }
  });

  // Right side info pills
  const infoItems = [
    ['CUSTOMER', customerName || '—'],
    ['PHONE', phoneNumber || '—'],
    ['FONT', fontFamily || '—'],
    ['ORDER TYPE', orderType === 'pickup' ? 'Pick Up' : 'Shipping'],
    ['QTY', `${quantity} unit(s)`],
  ];
  const infoX = PW / 2 + 8;
  const infoW = PW - M - infoX;
  infoItems.forEach(([label, value], i) => {
    const iy = curY + i * 8;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(infoX, iy - 1, infoW, 6.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text(label, infoX + 2, iy + 3.5);
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(value, infoX + infoW - 2, iy + 3.5, { align: 'right' });
  });

  curY += 46;

  // ── DIVIDER ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(M, curY, PW - M, curY);
  curY += 4;

  // ── SECTION: PLAYER LINEUP TABLE ────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);
  doc.text('TEAM LINEUP', M, curY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(130, 130, 130);
  doc.text(`${filledLineup.length} player(s)  •  ${quantity} jersey(s) ordered`, M + 30, curY);
  curY += 3;

  // Table header
  const colW = [10, 58, 24, 22, 52]; // #, Name, No., Size, Note
  const colX = [M];
  colW.slice(0, -1).forEach((w, i) => colX.push(colX[i] + w));
  const rowH = 7.5;
  const headers = ['#', 'SURNAME', 'NO.', 'SIZE', 'NOTE'];

  doc.setFillColor(20, 20, 20);
  doc.rect(M, curY, colW.reduce((a, b) => a + b), rowH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  headers.forEach((h, i) => {
    doc.text(h, colX[i] + colW[i] / 2, curY + rowH / 2 + 1, { align: 'center' });
  });
  curY += rowH;

  // Table rows
  const tableLineup = filledLineup.length > 0 ? filledLineup : [];
  tableLineup.forEach((player, idx) => {
    const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 248, 248];
    doc.setFillColor(...bg);
    doc.rect(M, curY, colW.reduce((a, b) => a + b), rowH, 'F');

    // Grid lines
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.rect(M, curY, colW.reduce((a, b) => a + b), rowH, 'S');

    // Highlight oversized sizes
    const size = player.size || '';
    const isOversized = ['XXL', '3XL', '4XL', '5XL'].includes(size.toUpperCase());

    const values = [
      String(idx + 1),
      (player.surname || '—').toUpperCase(),
      player.jerseyNumber || '—',
      size,
      player.note || '',
    ];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    values.forEach((val, i) => {
      if (i === 3 && isOversized) {
        // Pink highlight pill for oversized
        doc.setFillColor(255, 100, 150);
        doc.roundedRect(colX[i] + 1, curY + 1.5, colW[i] - 2, rowH - 3, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(30, 30, 30);
      }
      doc.text(val, colX[i] + colW[i] / 2, curY + rowH / 2 + 1.2, { align: 'center' });
      doc.setTextColor(30, 30, 30);
    });

    curY += rowH;
  });

  if (tableLineup.length === 0) {
    doc.setFillColor(250, 250, 250);
    doc.rect(M, curY, colW.reduce((a, b) => a + b), rowH, 'F');
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('No lineup provided — admin will confirm details', PW / 2, curY + rowH / 2 + 1, { align: 'center' });
    curY += rowH;
  }

  curY += 5;

  // ── SECTION: JERSEY PREVIEWS ─────────────────────────────────────────────────
  const jerseyW = 46;
  const jerseyH = 55;
  const jerseyGap = 8;
  const totalJerseysW = jerseyW * 2 + jerseyGap;
  const jerseyStartX = (PW - totalJerseysW) / 2;

  // Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('FRONT', jerseyStartX + jerseyW / 2, curY, { align: 'center' });
  doc.text('BACK', jerseyStartX + jerseyW + jerseyGap + jerseyW / 2, curY, { align: 'center' });
  curY += 2;

  // Draw both jerseys
  const previewNumber = filledLineup[0]?.jerseyNumber || jerseyNumber || '00';
  const previewLabel = customText || teamName || 'TEAM';
  drawJerseyOnPDF(doc, jerseyStartX, curY, jerseyW, jerseyH, primaryColor || '#cccccc', accentColor || '#333333', previewLabel, previewNumber, false);
  drawJerseyOnPDF(doc, jerseyStartX + jerseyW + jerseyGap, curY, jerseyW, jerseyH, primaryColor || '#cccccc', accentColor || '#333333', 'SURNAME', previewNumber, true);

  curY += jerseyH + 6;

  // ── LAYOUT NOTES ────────────────────────────────────────────────────────────
  if (jerseyLayoutComments && jerseyLayoutComments.trim()) {
    doc.setFillColor(255, 251, 230);
    doc.setDrawColor(230, 190, 80);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, curY, PW - 2 * M, 14, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 100, 0);
    doc.text('LAYOUT NOTES:', M + 3, curY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 50, 10);
    doc.setFontSize(7);
    const noteLines = doc.splitTextToSize(jerseyLayoutComments, PW - 2 * M - 36);
    doc.text(noteLines, M + 3, curY + 10);
    curY += 18;
  }

  // ── PRICING SUMMARY ──────────────────────────────────────────────────────────
  const halfW = (PW - 2 * M) / 2 - 3;
  const priceBoxH = 22;

  // Left: breakdown
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(M, curY, halfW, priceBoxH, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(`Unit Price:`, M + 3, curY + 6);
  doc.text(`P${(selectedProduct?.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, M + halfW - 3, curY + 6, { align: 'right' });
  doc.text(`Quantity:`, M + 3, curY + 12);
  doc.text(`${quantity}x`, M + halfW - 3, curY + 12, { align: 'right' });
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(M + 2, curY + 14.5, M + halfW - 2, curY + 14.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text('ORDER TOTAL:', M + 3, curY + 20);
  doc.text(`P${parseFloat(totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, M + halfW - 3, curY + 20, { align: 'right' });

  // Right: deposit box
  const depX = M + halfW + 6;
  doc.setFillColor(255, 237, 200);
  doc.setDrawColor(220, 160, 40);
  doc.setLineWidth(0.5);
  doc.roundedRect(depX, curY, halfW, priceBoxH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 80, 0);
  doc.text('DEPOSIT DUE NOW:', depX + 3, curY + 6);
  doc.setFontSize(14);
  doc.setTextColor(180, 80, 0);
  doc.text(`P${DEPOSIT_AMOUNT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, depX + 3, curY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(160, 100, 30);
  const remaining = (parseFloat(totalPrice || 0) - DEPOSIT_AMOUNT);
  doc.text(`Balance after deposit: P${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, depX + 3, curY + 20);

  curY += priceBoxH + 5;

  // ── PRODUCTION SIGN-OFF BAR ──────────────────────────────────────────────────
  const signFields = ['Graphic Artist', 'Printer', 'Fabric Cutter', 'Heat Press', 'Sewer'];
  const signBarH = 22;
  const signY = PH - signBarH - 5;

  doc.setFillColor(20, 20, 20);
  doc.rect(0, signY, PW, signBarH + 5, 'F');

  const fieldW = PW / signFields.length;
  signFields.forEach((field, i) => {
    const fx = i * fieldW;
    // Divider lines
    if (i > 0) {
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.3);
      doc.line(fx, signY + 2, fx, signY + signBarH + 2);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(220, 220, 220);
    doc.text(field, fx + fieldW / 2, signY + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text('Checked by: ___________', fx + fieldW / 2, signY + 15, { align: 'center' });
  });

  // ── FOOTER NOTE ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Generated ${new Date().toLocaleString('en-PH')}  •  This is an internal production document.`,
    PW / 2, signY - 3,
    { align: 'center' }
  );

  // ── SAVE ────────────────────────────────────────────────────────────────────
  const filename = `job-order-${(teamName || customText || 'order').replace(/\s+/g, '-').toLowerCase()}-${orderId || Date.now()}.pdf`;
  doc.save(filename);
};

// ── Fabric Type Selector (Dropdown) ────────────────────────────────────────────
const SearchableDropdown = ({ label, placeholder, value, onChange, options, renderOption, renderSelected, required }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = options.filter(opt =>
    JSON.stringify(opt).toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = () => { setOpen(o => !o); setSearch(''); };
  const handleClear = (e) => { e.stopPropagation(); onChange(null); setOpen(false); };

  return (
    <div className="mb-4" ref={ref}>
      {label && (
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
          {label}{required && ' *'}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 border text-left text-sm transition-all
            ${open ? 'border-[#111] ring-1 ring-[#111]' : 'border-gray-200 hover:border-gray-400'}
            ${value ? 'bg-white' : 'bg-white text-gray-400'}`}
        >
          <span className="flex-1 truncate min-w-0">
            {value ? renderSelected(value) : <span className="text-gray-400 text-xs">{placeholder}</span>}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <span onClick={handleClear}
                className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-gray-600 text-xs font-bold leading-none cursor-pointer">
                ✕
              </span>
            )}
            <ChevronIcon open={open} />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl"
            style={{ maxHeight: '280px', display: 'flex', flexDirection: 'column' }}>
            <div className="p-2 border-b border-gray-100 shrink-0">
              <div className="relative">
                <svg className="absolute left-2.5 top-2 text-gray-300" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 text-xs text-[#111] focus:outline-none focus:border-[#111] bg-gray-50"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1.5 text-gray-300 hover:text-gray-500 text-xs font-bold">✕</button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-4">No results for "{search}"</p>
              ) : (
                renderOption(filtered, (opt) => { onChange(opt); setOpen(false); setSearch(''); }, value)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FabricDropdown = ({ value, onChange }) => {
  const renderOption = (filtered, onSelect, currentValue) => (
    filtered.map(fabric => (
      <button
        key={fabric.id}
        onClick={() => onSelect(fabric)}
        className={`w-full text-left px-4 py-2.5 border-b border-gray-50 transition
          ${currentValue?.id === fabric.id
            ? 'bg-[#111] text-white'
            : 'hover:bg-gray-50 text-[#111]'}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className={`text-xs font-bold leading-tight ${currentValue?.id === fabric.id ? 'text-white' : 'text-[#111]'}`}>
              {fabric.name}
            </p>
            <p className={`text-[9px] leading-tight mt-0.5 ${currentValue?.id === fabric.id ? 'text-gray-300' : 'text-gray-400'}`}>
              {fabric.desc}
            </p>
          </div>
          {currentValue?.id === fabric.id && <CheckIcon />}
        </div>
      </button>
    ))
  );

  return (
    <SearchableDropdown
      label="Fabric Type"
      placeholder="Select fabric type..."
      value={value}
      onChange={onChange}
      options={FABRIC_TYPES}
      required
      renderSelected={(v) => (
        <span className="flex items-center gap-2">
          <FabricIcon />
          <span className="text-xs font-bold text-[#111]">{v.name}</span>
          <span className="text-[9px] text-gray-400">{v.desc}</span>
        </span>
      )}
      renderOption={renderOption}
    />
  );
};

// ── Color Picker ───────────────────────────────────────────────────────────────
const QUICK_COLORS = [
  '#000000','#1a1a1a','#333333','#555555','#808080','#aaaaaa','#cccccc','#ffffff',
  '#ff0000','#cc0000','#ff4444','#ff6600','#ff8800','#ffaa00','#ffcc00','#ffff00',
  '#00cc00','#008800','#00ff88','#00ccaa','#00aaff','#0066ff','#0000ff','#4400cc',
  '#8800cc','#cc00aa','#ff00ff','#ff44aa','#ff99cc','#ffccee','#ffeedd','#ffe4b5',
  '#ff6347','#dc143c','#b22222','#8b0000','#556b2f','#006400','#228b22','#2e8b57',
  '#1e90ff','#4169e1','#00008b','#191970','#9400d3','#8a2be2','#6a0dad','#483d8b',
];

const ColorPicker = ({ label, value, onChange }) => {
  const [hex, setHex] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setHex(value); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleHexInput = (e) => {
    const v = e.target.value;
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
  };

  const handleNativePicker = (e) => {
    setHex(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
      <div className="relative" ref={ref}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="w-9 h-9 rounded border-2 border-gray-300 shadow-sm flex-shrink-0 transition-transform hover:scale-110"
            style={{ backgroundColor: value, borderColor: value === '#ffffff' ? '#ccc' : value }} />
          <input type="text" value={hex} onChange={handleHexInput} onClick={e => e.stopPropagation()}
            placeholder="#000000" maxLength={7}
            className="w-28 px-2 py-1.5 border border-gray-200 text-xs font-mono text-[#111] focus:outline-none focus:border-[#111] uppercase" />
          <label className="cursor-pointer px-2 py-1.5 border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-wide flex items-center gap-1">
            <span>🎨</span>
            <input type="color" value={value} onChange={handleNativePicker} className="sr-only" />
          </label>
          <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            className="px-2 py-1.5 border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-wide">
            {open ? '▲' : '▼'}
          </button>
        </div>
        {open && (
          <div className="absolute z-50 top-12 left-0 bg-white border border-gray-200 shadow-xl p-3 w-72">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Quick Colors</p>
            <div className="grid grid-cols-8 gap-1.5 mb-3">
              {QUICK_COLORS.map(c => (
                <button key={c} onClick={() => { onChange(c); setHex(c); setOpen(false); }}
                  title={c}
                  className={`w-7 h-7 rounded transition-all hover:scale-125 hover:shadow-md ${value === c ? 'ring-2 ring-offset-1 ring-[#111] scale-110' : ''}`}
                  style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ddd' : '1px solid transparent' }}
                />
              ))}
            </div>
            <div className="border-t border-gray-100 pt-2">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Custom Color</p>
              <div className="flex items-center gap-2">
                <input type="color" value={value} onChange={handleNativePicker} className="w-10 h-9 border border-gray-200 cursor-pointer rounded" />
                <input type="text" value={hex} onChange={handleHexInput} placeholder="#000000" maxLength={7}
                  className="flex-1 px-2 py-1.5 border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#111] uppercase" />
                <button onClick={() => { if (/^#[0-9a-fA-F]{6}$/.test(hex)) { onChange(hex); setOpen(false); } }}
                  className="px-3 py-1.5 bg-[#111] text-white text-[10px] font-bold uppercase hover:bg-gray-800 transition">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Step Indicator ─────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, completedSteps }) => {
  const steps = [
    { num: 1, label: 'Colors & Qty' },
    { num: 2, label: 'Text' },
    { num: 3, label: 'Logo' },
    { num: 4, label: 'Lineup' },
    { num: 5, label: 'Details' },
  ];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => {
        const isCompleted = completedSteps.includes(step.num);
        const isCurrent = currentStep === step.num;
        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#111] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isCompleted ? <CheckIcon /> : step.num}
              </div>
              <span className={`text-xs font-medium hidden md:block whitespace-nowrap ${isCurrent ? 'text-[#111]' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-0 ${completedSteps.includes(step.num) ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Jersey SVG Front ───────────────────────────────────────────────────────────
const JerseyFront = ({ primary, accent, text, number, logo }) => (
  <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="bodyShade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
        <stop offset="50%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.18" />
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z" fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 105 115 L 55 80 Q 40 72 35 88 L 25 145 Q 22 160 38 163 L 105 170 Z" fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 295 115 L 345 80 Q 360 72 365 88 L 375 145 Q 378 160 362 163 L 295 170 Z" fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 150 105 Q 170 80 200 115 Q 230 80 250 105" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <path d="M 150 105 Q 170 80 200 115 Q 230 80 250 105" fill="none" stroke={primary} strokeWidth="5" strokeLinecap="round" />
      <line x1="105" y1="115" x2="150" y2="105" stroke={accent} strokeWidth="2.5" />
      <line x1="295" y1="115" x2="250" y2="105" stroke={accent} strokeWidth="2.5" />
      <rect x="105" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <rect x="281" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <path d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z" fill="url(#bodyShade)" />
      <path d="M 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 428 Q 295 438 280 438 L 120 438 Q 105 438 105 428 Z" fill={accent} opacity="0.5" />
      <text x="200" y="340" textAnchor="middle" fill={accent} fontSize="110" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="-4" opacity="0.95">
        {number || '24'}
      </text>
      <text x="200" y="235" textAnchor="middle" fill={accent} fontSize="28" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="3">
        {(text || 'TEAM NAME').toUpperCase()}
      </text>
      {logo ? (
        <image href={logo} x="168" y="148" width="64" height="64" preserveAspectRatio="xMidYMid meet" clipPath="circle(32px at 32px 32px)" />
      ) : (
        <g>
          <circle cx="200" cy="178" r="28" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3" />
          <text x="200" y="182" textAnchor="middle" fill={accent} fontSize="10" fontWeight="bold" fontFamily="'Arial Black', sans-serif" opacity="0.5" letterSpacing="1">LOGO</text>
        </g>
      )}
    </g>
  </svg>
);

// ── Jersey SVG Back ────────────────────────────────────────────────────────────
const JerseyBack = ({ primary, accent, number }) => (
  <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="bodyShadeB" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
        <stop offset="50%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
      </linearGradient>
      <filter id="shadowB" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.18" />
      </filter>
    </defs>
    <g filter="url(#shadowB)">
      <path d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z" fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 105 115 L 55 80 Q 40 72 35 88 L 25 145 Q 22 160 38 163 L 105 170 Z" fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 295 115 L 345 80 Q 360 72 365 88 L 375 145 Q 378 160 362 163 L 295 170 Z" fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 155 108 Q 200 95 245 108" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <path d="M 155 108 Q 200 95 245 108" fill="none" stroke={primary} strokeWidth="5" strokeLinecap="round" />
      <line x1="105" y1="115" x2="155" y2="108" stroke={accent} strokeWidth="2.5" />
      <line x1="295" y1="115" x2="245" y2="108" stroke={accent} strokeWidth="2.5" />
      <rect x="105" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <rect x="281" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <path d="M 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 428 Q 295 438 280 438 L 120 438 Q 105 438 105 428 Z" fill={accent} opacity="0.5" />
      <text x="200" y="185" textAnchor="middle" fill={accent} fontSize="22" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="4">SURNAME</text>
      <text x="200" y="350" textAnchor="middle" fill={accent} fontSize="110" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="-4">
        {number || '24'}
      </text>
      <path d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z" fill="url(#bodyShadeB)" />
    </g>
  </svg>
);

// ── Design Preview Panel ───────────────────────────────────────────────────────
const DesignPreview = ({ selectedProduct, primary, accent, text, number, logo, quantity, fabricType }) => {
  const [side, setSide] = useState('front');
  const selectedFabric = FABRIC_TYPES.find(f => f.id === fabricType?.id);

  return (
    <div className="bg-white border border-gray-200 flex flex-col" style={{ height: '100%' }}>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Design Preview</p>
        <div className="flex gap-1">
          {['front', 'back'].map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`px-3 py-1 text-xs font-bold uppercase border transition ${side === s ? 'bg-[#111] text-white border-[#111]' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'radial-gradient(ellipse at center, #e8e8e8 0%, #d0d0d0 100%)' }}>
        {selectedProduct ? (
          <div style={{ width: '260px', height: '312px' }}>
            {side === 'front'
              ? <JerseyFront primary={primary} accent={accent} text={text} number={number} logo={logo} />
              : <JerseyBack primary={primary} accent={accent} number={number} />}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-7xl mb-4" style={{ filter: 'grayscale(1) opacity(0.2)' }}>👕</p>
            <p className="text-sm text-gray-300 font-medium">Select a product to start designing</p>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 shrink-0">
        {selectedProduct ? (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-medium truncate pr-2">{selectedProduct.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{quantity} × ₱{selectedProduct.price}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                <ShirtIcon />{selectedProduct.name}
              </span>
            </div>
            {selectedFabric && (
              <div className="flex items-center gap-1.5 mt-1 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  <FabricIcon />{selectedFabric.name}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Est. Total</span>
              <span className="text-2xl font-black text-[#111]">₱{(selectedProduct.price * quantity).toFixed(2)}</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-300 text-center">No product selected</p>
        )}
        <div className="mt-3 space-y-0.5">
          {['Design preview is approximate', 'Final product may vary based on production', 'Admin will review and contact you'].map((note, i) => (
            <p key={i} className="text-[0.6rem] text-gray-300">• {note}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Lineup Builder ─────────────────────────────────────────────────────────────
const createEmptyPlayer = (index) => ({
  id: `player-${Date.now()}-${index}`,
  surname: '',
  jerseyNumber: '',
  size: 'M',
});

const LineupBuilder = ({ quantity, lineup, onChange }) => {
  const handlePlayerChange = (index, field, value) => {
    const updated = lineup.map((p, i) => i === index ? { ...p, [field]: value } : p);
    onChange(updated);
  };

  const addPlayer = () => {
    if (lineup.length >= 50) return;
    onChange([...lineup, createEmptyPlayer(lineup.length)]);
  };

  const removePlayer = (index) => {
    onChange(lineup.filter((_, i) => i !== index));
  };

  const filledCount = lineup.filter(p => p.surname.trim() && p.jerseyNumber.trim()).length;
  const isComplete = filledCount === quantity;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Team Lineup</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {filledCount} of {quantity} {quantity === 1 ? 'jersey' : 'jerseys'} filled
          </p>
        </div>
        <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border
          ${isComplete ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          {isComplete ? '✓ Complete' : `${quantity - filledCount} remaining`}
        </div>
      </div>

      <div className="w-full h-1 bg-gray-100 mb-4 rounded-full overflow-hidden">
        <div className="h-1 rounded-full transition-all duration-500"
          style={{
            width: quantity > 0 ? `${Math.min(100, (filledCount / quantity) * 100)}%` : '0%',
            background: isComplete ? '#22c55e' : '#f59e0b',
          }}
        />
      </div>

      <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '28px 1fr 80px 80px 32px' }}>
        <div />
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Surname</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No.</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Size</p>
        <div />
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {lineup.map((player, index) => {
          const isFilled = player.surname.trim() && player.jerseyNumber.trim();
          return (
            <div key={player.id}
              className={`grid gap-2 items-center p-2 border transition-all
                ${isFilled ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50'}`}
              style={{ gridTemplateColumns: '28px 1fr 80px 80px 32px' }}
            >
              <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-sm shrink-0
                ${isFilled ? 'bg-[#111] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {index + 1}
              </div>
              <input type="text" value={player.surname}
                onChange={(e) => handlePlayerChange(index, 'surname', e.target.value.toUpperCase())}
                placeholder="SURNAME" maxLength={20}
                className="w-full px-2 py-2 border border-gray-200 text-xs font-bold text-[#111] focus:outline-none focus:border-[#111] bg-white placeholder-gray-300 uppercase" />
              <input type="text" value={player.jerseyNumber}
                onChange={(e) => handlePlayerChange(index, 'jerseyNumber', e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="00" maxLength={3}
                className="w-full px-2 py-2 border border-gray-200 text-xs font-black text-[#111] text-center focus:outline-none focus:border-[#111] bg-white placeholder-gray-300" />
              <select value={player.size} onChange={(e) => handlePlayerChange(index, 'size', e.target.value)}
                className="w-full px-1 py-2 border border-gray-200 text-xs font-bold text-[#111] focus:outline-none focus:border-[#111] bg-white">
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => removePlayer(index)}
                className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                title="Remove player">
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </div>

      {lineup.length < quantity && (
        <button onClick={addPlayer}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 text-xs font-bold text-gray-400 hover:border-[#111] hover:text-[#111] transition uppercase tracking-widest">
          <PlusIcon /> Add Player
        </button>
      )}

      {lineup.length > quantity && (
        <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
          ⚠ You have {lineup.length} players but ordered {quantity} jerseys. Extra entries will be ignored.
        </div>
      )}

      <div className="mt-4 px-3 py-2.5 bg-gray-50 border border-gray-100">
        <p className="text-[9px] text-gray-400 leading-relaxed">
          <span className="font-bold text-gray-500">Tip:</span> Fill in all {quantity} player(s) before continuing. The lineup is optional — leave blank and the admin will contact you to confirm details.
        </p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
const FONTS = ['INDUSTRIAL SANS', 'IMPACT', 'ARIAL BLACK', 'BEBAS NEUE', 'OSWALD'];

export default function CustomizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // NEW: track placed order ID + PDF generating state
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#f5e6a3');
  const [color1, setColor1] = useState('#ffffff');
  const [color2, setColor2] = useState('#ffffff');
  const [color3, setColor3] = useState('#ffffff');
  const [quantity, setQuantity] = useState(1);

  // Fabric
  const [fabricType, setFabricType] = useState(null);

  // Text
  const [customText, setCustomText] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('24');
  const [fontFamily, setFontFamily] = useState('INDUSTRIAL SANS');
  const [jerseyLayoutComments, setJerseyLayoutComments] = useState('');

  // Logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Lineup
  const [lineup, setLineup] = useState([createEmptyPlayer(0)]);

  // Customer
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderType, setOrderType] = useState('pickup');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '', lastName: '', company: '', street: '', city: '', stateProvince: '', zipCode: '',
  });

  const totalPrice = selectedProduct ? (selectedProduct.price * (quantity || 0)).toFixed(2) : '0.00';

  useEffect(() => {
    setLineup(prev => {
      if (prev.length < quantity) {
        const extras = Array.from({ length: quantity - prev.length }, (_, i) => createEmptyPlayer(prev.length + i));
        return [...prev, ...extras];
      }
      return prev;
    });
  }, [quantity]);

  useEffect(() => {
    fetchProducts();
    if (location.state?.selectedProduct) setSelectedProduct(location.state.selectedProduct);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const max = 600;
        if (w > h && w > max) { h = (h * max) / w; w = max; }
        else if (h > max) { w = (w * max) / h; h = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setLogoFile(file);
    const compressed = await compressImage(file);
    setLogoPreview(compressed);
  };

  const handleProductSelect = (e) => {
    const product = products.find(p => p.id === e.target.value) || null;
    setSelectedProduct(product);
  };

  const goToStep = (step) => {
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!selectedProduct) { toast.error('Please select a product'); return; }
      if (!fabricType) { toast.error('Please select a fabric type'); return; }
    }
    if (currentStep === 5) { handleShowReview(); return; }
    goToStep(currentStep + 1);
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleShowReview = () => {
    if (!phoneNumber.trim()) { toast.error('Please enter your phone number'); return; }
    if (orderType === 'shipping') {
      const { firstName, lastName, street, city, stateProvince, zipCode } = shippingAddress;
      if (!firstName || !lastName || !street || !city || !stateProvince || !zipCode) {
        toast.error('Please fill out all shipping address fields'); return;
      }
    }
    setCompletedSteps(prev => prev.includes(5) ? prev : [...prev, 5]);
    setShowReview(true);
  };

  const filledLineup = lineup.filter(p => p.surname.trim() || p.jerseyNumber.trim());

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/orders', {
        userId: user.uid,
        customerName: user.displayName || user.email,
        customerEmail: user.email,
        phoneNumber,
        orderType,
        shippingAddress: orderType === 'shipping' ? shippingAddress : null,
        items: selectedProduct
          ? [{ productId: selectedProduct.id, productName: selectedProduct.name, quantity: parseInt(quantity), price: selectedProduct.price }]
          : [],
        customizationDetails: {
          apparelType: selectedProduct?.name || null,
          apparelCategory: selectedProduct?.category || null,
          primaryColor, accentColor,
          additionalColors: { color1, color2, color3 },
          fabricType: fabricType?.id || null,
          fabricName: fabricType?.name || null,
          customText, jerseyNumber, fontFamily, jerseyLayoutComments,
          logoImage: logoPreview || null,
          lineup: filledLineup.map(p => ({ surname: p.surname, jerseyNumber: p.jerseyNumber, size: p.size })),
        },
        totalPrice: parseFloat(totalPrice),
        depositAmount: DEPOSIT_AMOUNT,
        depositPaid: false,
        status: 'pending',
      });
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }; 
}
