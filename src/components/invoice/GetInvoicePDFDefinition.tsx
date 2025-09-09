import { HotelType, Invoice } from '@/types';
import { TDocumentDefinitions, StyleDictionary  } from 'pdfmake/interfaces';

interface InvoicePDFLayoutProps {
  selectedInvoice: Invoice;
  hotelsData: HotelType;
  menuMap: Record<string, string>;
  paymentColor: string;
  formatDate: (date: string) => string;
  getInvoiceTax: () => number;
}

export const getInvoicePDFDefinition = ({
  selectedInvoice,
  hotelsData,
  menuMap,
  paymentColor,
  formatDate,
  getInvoiceTax
}: InvoicePDFLayoutProps): TDocumentDefinitions => {
  const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
  const quantities = Array.isArray(selectedInvoice.quantities) ? selectedInvoice.quantities : [];
  const prices = Array.isArray(selectedInvoice.prices) ? selectedInvoice.prices : [];
  

  const itemsTable = [
    [
      { text: "Item", style: "tableHeader" },
      { text: "Qty", style: "tableHeader" },
      { text: "Price", style: "tableHeader" },
      { text: "Total", style: "tableHeader" }
    ],
    ...items.map((itemId, idx) => [
      { text: menuMap[itemId] || itemId, style: "tableItem" },
      { text: quantities[idx] ?? "", style: "tableItem" },
      { text: `$${parseFloat(prices[idx] ?? "0").toFixed(2)}`, style: "tableItem" },
      { text: `$${((parseInt(quantities[idx] ?? "0") * parseFloat(prices[idx] ?? "0")) || 0).toFixed(2)}`, style: "tableItem" },
    ]),
  ];

  return {
    content: [
      // Header Section
      {
        columns: [
          {
            text: "INVOICE",
            style: "header",
            width: '70%'
          },
          {
            text: `#${selectedInvoice.invoiceNumber || selectedInvoice.id}`,
            style: "invoiceNumber",
            alignment: 'right',
            width: '30%'
          }
        ]
      },

      // Divider
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#e5e7eb' }], margin: [0, 10, 0, 20] },

      // Company and Customer Info
      {
        columns: [
          {
            text: [
              { text: hotelsData?.name + "\n", style: "companyName" },
              { text: hotelsData?.address + "\n", style: "companyAddress" },
              { text: `Phone: ${hotelsData?.owner_phone + "\n"}`, style: "companyAddress" },
              { text: `Email: ${hotelsData?.email}`, style: "companyAddress" }
            ],
            width: '50%'
          },
          {
            stack: [
              {
                text: [
                  { text: "BILL TO: ", style: "sectionLabel" },
                  { text: selectedInvoice.customerName || "Guest", style: "customerName" }
                ],
                margin: [0, 0, 0, 5]
              },
              { text: `Table: ${selectedInvoice.tableNumber || "N/A"}`, style: "customerInfo" },
              { text: `Date: ${formatDate(selectedInvoice.createdAt)}`, style: "customerInfo" }
            ],
            width: '50%',
            alignment: 'right'
          }
        ]
      },

      // Spacer
      { text: "", margin: [0, 20] },

      // Payment Details
      {
        columns: [
          {
            text: [
              { text: "Payment Method\n", style: "sectionLabel" },
              {
                text: selectedInvoice.paymentMethod || "N/A",
                style: { fontSize: 12, color: paymentColor }
              }
            ]
          },
          {
            text: [
              { text: "Payment Status\n", style: "sectionLabel" },
              {
                text: selectedInvoice.paymentStatus || "N/A",
                style: selectedInvoice.paymentStatus === "paid" ? "statusPaid" : "statusPending"
              }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Items Table
      { text: "ORDER ITEMS", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto"],
          body: itemsTable,
        },
        layout: {
          hLineWidth: function (i: number) {
            return (i === 0 || i === itemsTable.length) ? 1 : 0;
          },
          vLineWidth: function () {
            return 0;
          },
          hLineColor: function (i: number) {
            return i === 1 ? '#3b82f6' : '#e5e7eb';
          },
          paddingLeft: function () { return 8; },
          paddingRight: function () { return 8; },
          paddingTop: function () { return 4; },
          paddingBottom: function () { return 4; }
        }
      },

      // Spacer
      { text: "", margin: [0, 20] },

      // Totals Section
      {
        stack: [
          {
            text: [
              { text: "Subtotal:  ", style: "totalLabel" },
              { text: `$${parseFloat(selectedInvoice.subtotal ?? "0").toFixed(2)}`, style: "totalValue"  }
            ],
            alignment: 'right',
            margin: [0, 0, 0, 5]
          },
          {
            text: [
              { text: "Tax:  ", style: "totalLabel" },
              { text: `$${getInvoiceTax().toFixed(2)}`, style: "totalValue" }
            ],
            alignment: 'right',
            margin: [0, 0, 0, 5]
          },
          {
            canvas: [{ type: 'line', x1: 0, y1: 5, x2: 130, y2: 5, lineWidth: 1, lineColor: '#e5e7eb' }],
            margin: [0, 10, 0, 20]
          },
          {
            text: [
              { text: "Grand Total:  ", style: "grandTotalLabel" },
              { text: `$${parseFloat(selectedInvoice.totalAmount ?? "0").toFixed(2)}`, style: "grandTotalValue" }
            ],
            alignment: 'right'
          }
        ],
        alignment: 'right',
        margin: [0, 0, 0, 30]
      },

      // Footer
      {
        text: [
          { text: "Thank you for dining with us!\n", style: "thankYou" },
          { text: `For any inquiries, please contact: | ${hotelsData?.email} | ${hotelsData?.owner_phone}`, style: "footer" }
        ],
        alignment: 'center',
        margin: [0, 30, 0, 0],
        style: "footerContainer"
      }
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        color: '#1f2937',
        margin: [0, 0, 0, 5]
      },
      invoiceNumber: {
        fontSize: 16,
        bold: true,
        color: '#3b82f6'
      },
      companyName: {
        fontSize: 16,
        bold: true,
        color: '#1f2937'
      },
      companyAddress: {
        fontSize: 10,
        color: '#6b7280',
        margin: [0, 2, 0, 0]
      },
      sectionLabel: {
        fontSize: 12,
        bold: true,
        color: '#374151'
      },
      customerName: {
        fontSize: 14,
        bold: true,
        color: '#1f2937',
        margin: [0, 2, 0, 0]
      },
      customerInfo: {
        fontSize: 11,
        color: '#6b7280',
        margin: [0, 2, 0, 0]
      },
      paymentInfo: {
        fontSize: 12,
        color: '#4b5563'
      },
      statusPaid: {
        fontSize: 12,
        color: '#059669',
        bold: true
      },
      statusPending: {
        fontSize: 12,
        color: '#dc2626',
        bold: true
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#1f2937',
        margin: [0, 0, 0, 10]
      },
      tableHeader: {
        fillColor: '#3b82f6',
        color: '#ffffff',
        bold: true,
        fontSize: 12,
        margin: [8, 6, 8, 6]
      },
      tableItem: {
        fontSize: 11,
        margin: [8, 6, 8, 6],
        color: '#374151'
      },
      totalLabel: {
        fontSize: 12,
        color: '#6b7280'
      },
      totalValue: {
        fontSize: 12,
        color: '#374151',
        alignment: 'right',
        margin: [10, 0, 0, 0]
      },
      grandTotalLabel: {
        fontSize: 14,
        bold: true,
        color: '#1f2937'
      },
      grandTotalValue: {
        fontSize: 14,
        bold: true,
        color: '#059669',
        alignment: 'right',
        margin: [15, 0, 0, 0]
      },
      thankYou: {
        fontSize: 14,
        bold: true,
        color: '#3b82f6',
      },
      footer: {
        fontSize: 10,
        color: '#9ca3af',
        italics: true
      },
      footerContainer: {
        background: '#f9fafb',
        margin: [10, 10, 10, 10]
      }
    } as StyleDictionary,
    pageMargins: [40, 40, 40, 40],
    pageSize: 'A4'
  };
};