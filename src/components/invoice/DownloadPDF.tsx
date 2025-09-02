import pdfMake, { TDocumentDefinitions } from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Invoice } from "@/types"; // adjust import if needed

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const downloadPDF = (selectedInvoice: Invoice, menuMap: Record<string, string>) => {
  if (!selectedInvoice) return;

  try {
    // Build items table
    const itemsTable = [
      ["Item", "Qty", "Price", "Total"],
      ...selectedInvoice.items.map((itemId, idx) => [
        menuMap[itemId] || itemId,
        selectedInvoice.quantities[idx],
        `$${parseFloat(selectedInvoice.prices[idx]).toFixed(2)}`,
        `$${(
          parseInt(selectedInvoice.quantities[idx]) *
          parseFloat(selectedInvoice.prices[idx])
        ).toFixed(2)}`,
      ]),
    ];

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: "Invoice", style: "header" },
        {
          text: `Invoice Number: ${selectedInvoice.invoiceNumber || selectedInvoice.id}`,
          style: "subheader",
        },
        { text: `Date: ${new Date(selectedInvoice.createdAt).toLocaleDateString()}` },
        { text: `Customer: ${selectedInvoice.customerName}` },
        { text: `Table: ${selectedInvoice.tableNumber}` },
        { text: `Payment Method: ${selectedInvoice.paymentMethod}` },
        { text: `Payment Status: ${selectedInvoice.paymentStatus}` },

        { text: "\nItems:", style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: itemsTable,
          },
        },

        {
          text: `\nSubtotal: $${parseFloat(selectedInvoice.subtotal).toFixed(2)}`,
          style: "total",
        },
        {
          text: `Tax: $${parseFloat(selectedInvoice.tax).toFixed(2)}`,
          style: "total",
        },
        {
          text: `Grand Total: $${parseFloat(selectedInvoice.totalAmount).toFixed(2)}`,
          style: "total",
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        total: { fontSize: 14, bold: true, alignment: "right", margin: [0, 20, 0, 0] },
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`invoice-${selectedInvoice.invoiceNumber || selectedInvoice.id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
