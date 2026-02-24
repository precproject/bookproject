import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const downloadInvoice = (order, storeName = "Sahakar Stree") => {
  const doc = new jsPDF();

  // 1. Header Section
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text("TAX INVOICE", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Store: ${storeName}`, 14, 30);
  doc.text(`Order ID: ${order.orderId}`, 14, 35);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 40);
  doc.text(`Status: ${order.payment.status === 'Success' ? 'PAID' : 'PENDING'}`, 14, 45);

  // 2. Billing/Shipping Details
  doc.setTextColor(40);
  doc.setFontSize(12);
  doc.text("Shipping Address:", 14, 60);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  // Split long addresses into multiple lines
  const splitAddress = doc.splitTextToSize(order.shipping.address || 'Digital Delivery', 80);
  doc.text(splitAddress, 14, 66);

  // 3. Table of Items
  const tableColumn = ["Item Name", "Type", "Qty", "Unit Price", "Total"];
  const tableRows = [];

  order.items.forEach(item => {
    const itemData = [
      item.name,
      item.book?.type || 'Book',
      item.qty.toString(),
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.qty}`
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [76, 175, 80] }, // Green header
  });

  // 4. Financial Summary (Bottom Right)
  const finalY = doc.lastAutoTable.finalY || 85;
  doc.setFontSize(10);
  doc.setTextColor(40);
  
  doc.text(`Subtotal: Rs. ${order.priceBreakup.subtotal}`, 140, finalY + 10);
  doc.text(`Shipping: Rs. ${order.priceBreakup.shipping}`, 140, finalY + 16);
  
  if (order.priceBreakup.discountAmount < 0) {
    doc.text(`Discount: Rs. ${order.priceBreakup.discountAmount}`, 140, finalY + 22);
  }

  doc.setFontSize(12);
  doc.setTextColor(211, 47, 47); // Red for total
  // Adjust Y positioning based on whether discount exists
  const totalY = order.priceBreakup.discountAmount < 0 ? finalY + 30 : finalY + 24;
  doc.text(`Grand Total: Rs. ${order.priceBreakup.total}`, 140, totalY);

  // 5. Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for Purchase ! Happy Reading !", 105, 280, null, null, "center");

  // Trigger Download
  doc.save(`Invoice_${order.orderId}.pdf`);
};