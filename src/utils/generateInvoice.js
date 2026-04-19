import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to safely convert font buffer to base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const downloadInvoice = async (order, storeName = "Sahakar Stree") => {
  // Failsafe: Ensure order exists before generating
  if (!order) {
    console.error("Invoice Error: No order data provided.");
    return false;
  }

  const doc = new jsPDF('p', 'mm', 'a4');

  try {
    // 1. FETCH MARATHI FONT (Stable Google Fonts Repo)
    const fontUrl = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-devanagari/NotoSansDevanagari_400Regular.ttf';
    const response = await fetch(fontUrl);
    
    if (!response.ok) throw new Error("Failed to download font file.");
    
    const buffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(buffer);
    
    doc.addFileToVFS('NotoSansDevanagari.ttf', fontBase64);
    doc.addFont('NotoSansDevanagari.ttf', 'NotoSans', 'normal');

    // ==========================================
    // 2. HEADER & BRANDING (Using Default English Font)
    // ==========================================
    doc.setFont('helvetica', 'normal'); // Force default font for reliability
    
    doc.setFontSize(24);
    doc.setTextColor(234, 88, 12); // Brand Orange
    doc.text(storeName, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Email: support@sahakarstree.com", 14, 28);
    doc.text("Phone: +91 9970983794", 14, 33);
    doc.text("Website: www.sahakarstree.com", 14, 38);

    // INVOICE BADGE (Top Right)
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("TAX INVOICE", 150, 22);

    doc.setFontSize(10);
    doc.text(`Order ID: #${order.orderId}`, 150, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 150, 35);
    
    // Payment Status Logic
    let paymentText = 'PENDING';
    if (order.payment?.status === 'Success') paymentText = 'PAID (ONLINE)';
    else if (order.payment?.method === 'COD') paymentText = order.status === 'Delivered' ? 'PAID (COD)' : 'CASH ON DELIVERY';
    
    doc.text(`Status: ${paymentText}`, 150, 40);

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 45, 196, 45);

    // ==========================================
    // 3. CUSTOMER DETAILS
    // ==========================================
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Billed To:", 14, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    let addressText = 'Digital Delivery';
    if (order.shipping?.street && order.shipping.street !== 'Digital Delivery' && order.shipping.street !== 'Digital') {
      addressText = `${order.shipping.fullName}\nPhone: ${order.shipping.phone}\n${order.shipping.street}, ${order.shipping.city}\n${order.shipping.state} - ${order.shipping.pincode}`;
    }

    const splitAddress = doc.splitTextToSize(addressText, 80);
    doc.text(splitAddress, 14, 62);

    // ==========================================
    // 4. ITEMS TABLE (Switching to Marathi Font for Rows)
    // ==========================================
    const tableColumn = ["Item Description", "Type", "Qty", "Unit Price", "Total"];
    const tableRows = order.items.map(item => [
      item.name, 
      item.book?.type || item.type || 'Book',
      item.qty.toString(),
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.qty}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22], textColor: 255, font: 'helvetica' }, // English Header
      bodyStyles: { font: 'NotoSans', textColor: 50 }, // Marathi Body!
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 10 }
    });

    // ==========================================
    // 5. DETAILED FINANCIAL SUMMARY
    // ==========================================
    doc.setFont('helvetica', 'normal'); // Switch BACK to reliable English font
    
    // Support for multiple versions of jspdf-autotable finalY property
    let currentY = (doc.autoTable?.previous?.finalY || doc.lastAutoTable?.finalY || 85) + 10;
    
    const labelX = 130;
    const valueX = 196; 
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const addFinanceRow = (label, value, isHighlight = false, isGreen = false) => {
      doc.setTextColor(isHighlight ? 234 : isGreen ? 22 : 80, isHighlight ? 88 : isGreen ? 163 : 80, isHighlight ? 12 : isGreen ? 74 : 80);
      if (isHighlight) doc.setFontSize(12); else doc.setFontSize(10);
      
      doc.text(label, labelX, currentY);
      doc.text(value, valueX, currentY, { align: 'right' });
      currentY += 7;
    };

    addFinanceRow("Subtotal:", `Rs. ${order.priceBreakup?.subtotal || 0}`);
    
    const shippingDisplay = order.priceBreakup?.shipping === 0 ? 'Free' : `Rs. ${order.priceBreakup?.shipping}`;
    addFinanceRow("Shipping Charge:", shippingDisplay);

    if (order.priceBreakup?.codFee > 0) {
      addFinanceRow("Cash on Delivery Fee:", `+ Rs. ${order.priceBreakup.codFee}`);
    }

    if (order.priceBreakup?.taxAmount > 0) {
      addFinanceRow("GST Tax:", `+ Rs. ${order.priceBreakup.taxAmount}`);
    }
    
    if (order.priceBreakup?.discountAmount > 0) {
      const discountLabel = order.priceBreakup?.discountCode ? `Discount (${order.priceBreakup.discountCode}):` : "Discount:";
      addFinanceRow(discountLabel, `- Rs. ${order.priceBreakup.discountAmount}`, false, true);
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(labelX, currentY - 3, valueX, currentY - 3);
    
    addFinanceRow("Grand Total:", `Rs. ${order.priceBreakup?.total || 0}`, true);

    // ==========================================
    // 6. MARATHI BOOK HIGHLIGHTS (Marketing)
    // ==========================================
    doc.setFont('NotoSans'); // Switch to Marathi font for this block
    const highlightY = (doc.autoTable?.previous?.finalY || doc.lastAutoTable?.finalY || 85) + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(234, 88, 12);
    doc.text("हे पुस्तक का वाचावे?", 14, highlightY); 
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const highlights = [
      "• मराठा समाजाच्या खंबीर वृत्तीवर आधारित आर्थिक स्वातंत्र्याची ब्लूप्रिंट.",
      "• व्यावसायिक यश आणि प्रगतीसाठी आवश्यक आधुनिक विचारसरणी.",
      "• वारसा पराक्रमाचा: चिंतनातून चिंतामुक्तीकडे नेणारा प्रेरणादायी प्रवास.",
      "• स्वतःच्या आर्थिक नियोजनाची आणि विकासाची अचूक दिशा."
    ];
    
    let bulletY = highlightY + 7;
    highlights.forEach(point => {
      const splitPoint = doc.splitTextToSize(point, 100);
      doc.text(splitPoint, 14, bulletY);
      bulletY += (splitPoint.length * 5); 
    });

    // ==========================================
    // 7. FOOTER
    // ==========================================
    doc.setFont('helvetica', 'normal'); // Switch BACK to English font for footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your purchase! Happy Reading!", 105, 280, { align: "center" });
    doc.text("This is a computer generated invoice and does not require a physical signature.", 105, 285, { align: "center" });

    // 8. TRIGGER DOWNLOAD
    doc.save(`Invoice_${order.orderId}.pdf`);
    
    return true;

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Could not generate PDF. Please check your internet connection and try again.");
    return false;
  }
};