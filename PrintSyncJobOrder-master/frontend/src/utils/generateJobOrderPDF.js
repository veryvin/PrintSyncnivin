import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

/**
 * Generate a Job Order PDF for admin production teams
 * @param {Object} orderData - Order details
 */
export const generateJobOrderPDF = async (orderData) => {
  const {
    orderId,
    teamName,
    selectedProduct,
    fabricType,
    primaryColor,
    accentColor,
    color1,
    color2,
    color3,
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
  } = orderData;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Helper to add text
  const addText = (text, fontSize = 10, isBold = false, color = null) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    if (color) {
      doc.setTextColor(color);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.text(text, margin, y);
    y += fontSize > 12 ? 8 : 5;
  };

  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const addField = (label, value, indent = 0) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label.toUpperCase(), margin + indent, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(String(value || '—'), margin + indent + 35, y);
    y += 6;
  };

  // ── HEADER ──
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('JOB ORDER', margin, 17);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${orderId}`, pageWidth - margin - 40, 17);

  y = 35;

  // ── ORDER INFO ──
  addText('ORDER INFORMATION', 14, true);
  addLine();
  addField('Customer', customerName || 'N/A');
  addField('Phone', phoneNumber || 'N/A');
  addField('Order Date', orderDate || new Date().toLocaleDateString());
  addField('Order Type', orderType === 'pickup' ? 'Pick Up' : 'Shipping');
  if (deadline) {
    addField('Deadline', deadline);
  }
  addField('Total Price', `₱${parseFloat(totalPrice).toLocaleString()}`);

  y += 5;
  addLine();

  // ── PRODUCT DETAILS ──
  addText('PRODUCT SPECIFICATIONS', 14, true);
  addLine();
  addField('Product', selectedProduct?.name || 'N/A');
  addField('Unit Price', selectedProduct?.price ? `₱${selectedProduct.price}` : 'N/A');
  addField('Quantity', quantity || 1);
  addField('Fabric Type', fabricType?.name || 'N/A');

  y += 5;
  addLine();

  // ── DESIGN DETAILS ──
  addText('DESIGN & CUSTOMIZATION', 14, true);
  addLine();
  addField('Team Name', customText || teamName || 'N/A');
  addField('Jersey Number', jerseyNumber || 'N/A');
  addField('Font Family', fontFamily || 'N/A');
  addField('Primary Color', primaryColor || 'N/A');
  addField('Accent Color', accentColor || 'N/A');

  if (color1 || color2 || color3) {
    const additionalColors = [color1, color2, color3].filter(Boolean).join(', ');
    addField('Additional Colors', additionalColors);
  }

  if (jerseyLayoutComments) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('LAYOUT COMMENTS', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const splitComments = doc.splitTextToSize(jerseyLayoutComments, pageWidth - 2 * margin);
    doc.text(splitComments, margin, y);
    y += splitComments.length * 5 + 5;
  }

  y += 5;
  addLine();

  // ── TEAM LINEUP ──
  if (filledLineup && filledLineup.length > 0) {
    addText('TEAM LINEUP', 14, true);
    addLine();

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 2, pageWidth - 2 * margin, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('#', margin + 3, y + 3);
    doc.text('SURNAME', margin + 15, y + 3);
    doc.text('JERSEY NO.', margin + 65, y + 3);
    doc.text('SIZE', margin + 100, y + 3);
    y += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    filledLineup.forEach((player, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(String(index + 1), margin + 3, y);
      doc.text(player.surname || '—', margin + 15, y);
      doc.text(player.jerseyNumber || '—', margin + 65, y);
      doc.text(player.size || '—', margin + 100, y);
      y += 7;
    });
  } else {
    addText('TEAM LINEUP: Not provided', 10, false, 150);
  }

  y += 10;
  addLine();

  // ── SIGN-OFF FIELDS ──
  addText('PRODUCTION SIGN-OFF', 14, true);
  addLine();

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  // Layout sign-off
  doc.text('Layout Designer:', margin, y);
  doc.line(margin + 30, y - 1, margin + 90, y - 1);
  doc.text('Date:', margin + 95, y);
  doc.line(margin + 110, y - 1, margin + 140, y - 1);
  y += 12;

  // Production sign-off
  doc.text('Production Staff:', margin, y);
  doc.line(margin + 30, y - 1, margin + 90, y - 1);
  doc.text('Date:', margin + 95, y);
  doc.line(margin + 110, y - 1, margin + 140, y - 1);
  y += 12;

  // Quality check sign-off
  doc.text('Quality Checker:', margin, y);
  doc.line(margin + 30, y - 1, margin + 90, y - 1);
  doc.text('Date:', margin + 95, y);
  doc.line(margin + 110, y - 1, margin + 140, y - 1);
  y += 12;

  // Release sign-off
  doc.text('Released By:', margin, y);
  doc.line(margin + 30, y - 1, margin + 90, y - 1);
  doc.text('Date:', margin + 95, y);
  doc.line(margin + 110, y - 1, margin + 140, y - 1);

  // ── FOOTER ──
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by PrintSync • https://printsync.com', pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  doc.save(`JobOrder-${orderId}.pdf`);
  return true;
};

export default generateJobOrderPDF;