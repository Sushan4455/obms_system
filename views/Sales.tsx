
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Filter, Download, Send, Trash2, X, 
  PlusCircle, MinusCircle, Printer, Eye, MoreHorizontal,
  CreditCard, CheckCircle, ArrowLeft, QrCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, InvoiceItem, Contact, Payment, AppSettings } from '../types';
import { VAT_RATE } from '../constants';

interface SalesProps {
  invoices: Invoice[];
  contacts: Contact[];
  onAddInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onAddPayment: (payment: Payment, invoiceId: string) => void;
  fiscalYear: string;
  settings: AppSettings;
}

const Sales: React.FC<SalesProps> = ({ 
  invoices, 
  contacts, 
  onAddInvoice, 
  onDeleteInvoice, 
  onAddPayment,
  fiscalYear,
  settings
}) => {
  // Views: LIST, CREATE, VIEW
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'VIEW'>('LIST');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // List State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    customerName: '',
    customerPan: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    items: [],
    type: 'TAX_INVOICE'
  });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<Partial<Payment>>({
    amount: 0,
    method: 'CASH',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });

  // --- Calculations ---

  const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    let subTotal = 0;
    let taxableAmount = 0;
    let nonTaxableAmount = 0;

    items.forEach(item => {
      subTotal += item.amount;
      if (item.isTaxable) {
        taxableAmount += item.amount;
      } else {
        nonTaxableAmount += item.amount;
      }
    });

    const vatAmount = taxableAmount * VAT_RATE;
    const totalAmount = taxableAmount + nonTaxableAmount + vatAmount;

    return { subTotal, taxableAmount, nonTaxableAmount, vatAmount, totalAmount };
  };

  // --- Handlers ---

  const handleDownloadPDF = async () => {
    const input = document.getElementById('invoice-template');
    if (!input) {
      alert('Invoice template not found');
      return;
    }
    
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      
      // Basic support for multipage, though invoice usually fits on one
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Invoice-${selectedInvoice?.number || 'Draft'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error generating PDF');
    }
  };

  const handleContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contact = contacts.find(c => c.id === e.target.value);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        contactId: contact.id,
        customerName: contact.name,
        customerPan: contact.pan,
        customerAddress: contact.address
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(formData.items || [])];
    const item = { ...newItems[index], [field]: value };
    
    // Recalculate line amount
    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      const gross = Number(item.quantity) * Number(item.rate);
      const discount = Number(item.discount) || 0;
      item.amount = gross - discount;
    }

    newItems[index] = item;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addNewLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { 
        id: `temp-${Date.now()}`, 
        description: '', 
        quantity: 1, 
        rate: 0, 
        discount: 0, 
        amount: 0, 
        isTaxable: true 
      }]
    }));
  };

  const removeLineItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const saveInvoice = () => {
    const items = formData.items || [];
    const totals = calculateInvoiceTotals(items);
    
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      number: `INV-${fiscalYear.replace('/','-')}-${String(invoices.length + 1).padStart(4, '0')}`,
      fiscalYear,
      date: formData.date!,
      dueDate: formData.dueDate!,
      contactId: formData.contactId || 'unknown',
      customerName: formData.customerName || 'Cash Customer',
      customerPan: formData.customerPan || '',
      customerAddress: formData.customerAddress || '',
      items: items,
      ...totals,
      discountTotal: items.reduce((sum, i) => sum + (i.discount || 0), 0),
      paidAmount: 0,
      dueAmount: totals.totalAmount,
      payments: [],
      status: 'SENT',
      type: totals.vatAmount > 0 ? 'TAX_INVOICE' : 'ABBREVIATED_INVOICE',
      isPrinted: false
    };

    onAddInvoice(newInvoice);
    setViewMode('LIST');
    setFormData({ items: [] });
  };

  const submitPayment = () => {
    if (!selectedInvoice) return;
    
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      invoiceId: selectedInvoice.id,
      date: paymentData.date!,
      amount: Number(paymentData.amount),
      method: paymentData.method as any,
      reference: paymentData.reference || ''
    };

    onAddPayment(payment, selectedInvoice.id);
    setIsPaymentModalOpen(false);
  };

  // --- Derived State ---
  
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const salesStats = useMemo(() => {
    return {
      totalSales: invoices.reduce((acc, inv) => acc + inv.totalAmount, 0),
      vatCollected: invoices.reduce((acc, inv) => acc + inv.vatAmount, 0),
      totalDue: invoices.reduce((acc, inv) => acc + inv.dueAmount, 0),
      paidCount: invoices.filter(inv => inv.status === 'PAID').length
    };
  }, [invoices]);

  const totals = calculateInvoiceTotals(formData.items || []);

  // --- Render Components ---

  if (viewMode === 'CREATE') {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Create Tax Invoice</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
          {/* Customer & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Customer Details</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                onChange={handleContactSelect}
                defaultValue=""
              >
                <option value="" disabled>Select Existing Customer</option>
                {contacts.filter(c => c.type === 'CUSTOMER').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input 
                placeholder="Customer Name" 
                className="w-full p-3 border border-slate-200 rounded-xl"
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
              />
              <div className="flex space-x-4">
                <input 
                  placeholder="PAN / VAT No" 
                  className="w-full p-3 border border-slate-200 rounded-xl"
                  value={formData.customerPan}
                  onChange={e => setFormData({...formData, customerPan: e.target.value})}
                />
                <input 
                  placeholder="Address" 
                  className="w-full p-3 border border-slate-200 rounded-xl"
                  value={formData.customerAddress}
                  onChange={e => setFormData({...formData, customerAddress: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Invoice Details</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Invoice Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border border-slate-200 rounded-xl"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border border-slate-200 rounded-xl"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                 <p className="text-xs text-blue-800 font-bold uppercase">Fiscal Year</p>
                 <p className="text-lg font-bold text-blue-900">{fiscalYear}</p>
                 <p className="text-xs text-blue-600 mt-1">Auto-numbering enabled</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-2">Item Description</th>
                  <th className="py-3 px-2 w-20 text-right">Qty</th>
                  <th className="py-3 px-2 w-28 text-right">Rate</th>
                  <th className="py-3 px-2 w-24 text-right">Discount</th>
                  <th className="py-3 px-2 w-20 text-center">Taxable</th>
                  <th className="py-3 px-2 w-32 text-right">Amount</th>
                  <th className="py-3 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {formData.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-2">
                      <input 
                        className="w-full p-2 bg-slate-50 rounded-lg"
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="number" min="1"
                        className="w-full p-2 bg-slate-50 rounded-lg text-right"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="number" min="0"
                        className="w-full p-2 bg-slate-50 rounded-lg text-right"
                        value={item.rate}
                        onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="number" min="0"
                        className="w-full p-2 bg-slate-50 rounded-lg text-right"
                        value={item.discount}
                        onChange={e => handleItemChange(idx, 'discount', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-blue-600"
                        checked={item.isTaxable}
                        onChange={e => handleItemChange(idx, 'isTaxable', e.target.checked)}
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {item.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button onClick={() => removeLineItem(idx)} className="text-slate-400 hover:text-rose-500">
                        <MinusCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addNewLineItem} className="mt-4 flex items-center space-x-2 text-blue-600 font-semibold text-sm hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              <PlusCircle size={16} /> <span>Add Line Item</span>
            </button>
          </div>

          {/* Footer Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 bg-slate-50 p-6 rounded-xl space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Sub Total</span>
                <span className="font-medium">{totals.subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Non-Taxable Amount</span>
                <span className="font-medium">{totals.nonTaxableAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Taxable Amount</span>
                <span className="font-medium">{totals.taxableAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>VAT (13%)</span>
                <span className="font-medium">{totals.vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-bold text-slate-900">
                <span>Grand Total</span>
                <span>Rs. {totals.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4 border-t border-slate-100 pt-6">
            <button onClick={() => setViewMode('LIST')} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <button 
              onClick={saveInvoice}
              disabled={formData.items?.length === 0}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'VIEW' && selectedInvoice) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button onClick={() => setViewMode('LIST')} className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft size={20} /> <span>Back to Invoices</span>
          </button>
          <div className="flex space-x-3">
             {selectedInvoice.status !== 'PAID' && (
              <button 
                onClick={() => {
                   setPaymentData({ ...paymentData, amount: selectedInvoice.dueAmount });
                   setIsPaymentModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                <CreditCard size={18} /> <span>Record Payment</span>
              </button>
             )}
            <button onClick={handleDownloadPDF} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
              <Download size={18} /> <span>Download PDF</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800">
              <Printer size={18} /> <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* IRD Compliant Invoice Template */}
        <div id="invoice-template" className="bg-white p-10 max-w-[210mm] mx-auto shadow-lg print:shadow-none print:p-0 print:max-w-none text-black">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">{settings.companyName}</h1>
                <p className="text-sm">{settings.address}</p>
                <p className="text-sm">PAN: {settings.pan}</p>
                <p className="text-sm">Phone: 01-4000000</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase mb-1">Tax Invoice</h2>
                <div className="border border-black p-2 text-center inline-block min-w-[120px]">
                  <p className="text-xs font-bold uppercase">Invoice No</p>
                  <p className="font-mono font-bold">{selectedInvoice.number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex justify-between mb-8">
            <div className="w-1/2">
              <p><span className="font-bold">Buyer Name:</span> {selectedInvoice.customerName}</p>
              <p><span className="font-bold">Address:</span> {selectedInvoice.customerAddress || 'N/A'}</p>
              <p><span className="font-bold">Buyer PAN:</span> {selectedInvoice.customerPan || 'N/A'}</p>
              <p><span className="font-bold">Mode of Payment:</span> {selectedInvoice.status === 'PAID' ? 'Paid' : 'Credit'}</p>
            </div>
            <div className="w-1/2 text-right">
              <p><span className="font-bold">Transaction Date:</span> {selectedInvoice.date}</p>
              <p><span className="font-bold">Fiscal Year:</span> {selectedInvoice.fiscalYear}</p>
              <p><span className="font-bold">Printed on:</span> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-black mb-6 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-10">SN</th>
                <th className="border border-black p-2 text-left">Description</th>
                <th className="border border-black p-2 text-center w-20">Qty</th>
                <th className="border border-black p-2 text-right w-24">Rate</th>
                <th className="border border-black p-2 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-center">{idx + 1}</td>
                  <td className="border border-black p-2">{item.description}</td>
                  <td className="border border-black p-2 text-center">{item.quantity}</td>
                  <td className="border border-black p-2 text-right">{item.rate.toFixed(2)}</td>
                  <td className="border border-black p-2 text-right">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Calculations */}
          <div className="flex justify-end mb-12">
            <div className="w-64 border border-black text-sm">
               <div className="flex justify-between p-2 border-b border-black">
                 <span>Sub Total</span>
                 <span className="font-bold">{selectedInvoice.subTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-b border-black">
                 <span>Discount</span>
                 <span>{selectedInvoice.discountTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-b border-black">
                 <span>Taxable Amount</span>
                 <span>{selectedInvoice.taxableAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-b border-black">
                 <span>VAT (13%)</span>
                 <span>{selectedInvoice.vatAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 bg-gray-100 font-bold text-base">
                 <span>Grand Total</span>
                 <span>{selectedInvoice.totalAmount.toFixed(2)}</span>
               </div>
            </div>
          </div>

          <div className="mb-8 text-sm">
             <p className="font-bold">In Words:</p> 
             <p className="italic border-b border-dotted border-black pb-1">
               {/* Simplified mock function for words */}
               NPR {Math.floor(selectedInvoice.totalAmount)} and {Math.round((selectedInvoice.totalAmount % 1) * 100)}/100 Only.
             </p>
          </div>

          {/* Signatures & QR */}
          <div className="flex justify-between items-end mt-12 pt-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center mb-2">
                 <QrCode size={48} className="opacity-50"/>
              </div>
              <p className="text-xs">IRD Registered</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-black mb-2 h-10"></div>
              <p className="text-sm font-bold">Authorized Signature</p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>This is a computer generated invoice.</p>
          </div>
        </div>

        {/* Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold mb-4">Record Payment</h3>
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Received</label>
                   <input 
                    type="number"
                    className="w-full p-3 border rounded-xl"
                    value={paymentData.amount}
                    onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                   <select 
                    className="w-full p-3 border rounded-xl"
                    value={paymentData.method}
                    onChange={e => setPaymentData({...paymentData, method: e.target.value as any})}
                   >
                     <option value="CASH">Cash</option>
                     <option value="BANK_TRANSFER">Bank Transfer</option>
                     <option value="CHEQUE">Cheque</option>
                     <option value="ESEWA">eSewa</option>
                     <option value="KHALTI">Khalti</option>
                     <option value="FONEPAY">FonePay</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reference / Transaction ID</label>
                   <input 
                    className="w-full p-3 border rounded-xl"
                    value={paymentData.reference}
                    onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                    placeholder="e.g. Cheque No or TXN ID"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                   <input 
                    type="date"
                    className="w-full p-3 border rounded-xl"
                    value={paymentData.date}
                    onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                   />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-600">Cancel</button>
                <button onClick={submitPayment} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200">Save Payment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT: LIST VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales Invoices</h2>
          <p className="text-slate-500">Manage invoices, payments and customer balances.</p>
        </div>
        <button 
          onClick={() => setViewMode('CREATE')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-shadow shadow-md shadow-blue-200"
        >
          <Plus size={18} />
          <span>New Tax Invoice</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Sales</p>
          <p className="text-xl font-bold text-slate-900">Rs. {salesStats.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">VAT Collected</p>
          <p className="text-xl font-bold text-blue-600">Rs. {salesStats.vatCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Outstanding Due</p>
          <p className="text-xl font-bold text-rose-600">Rs. {salesStats.totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Fully Paid</p>
          <p className="text-xl font-bold text-emerald-600">{salesStats.paidCount} <span className="text-sm font-medium text-slate-400">Invoices</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 bg-white p-2 rounded-xl border border-slate-200 w-fit">
        {['ALL', 'DRAFT', 'SENT', 'PAID', 'PARTIAL'].map(status => (
           <button
             key={status}
             onClick={() => setFilterStatus(status)}
             className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterStatus === status ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
           >
             {status}
           </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
           <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Number or Customer..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Invoice #</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.number}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {inv.customerName}
                    {inv.customerPan && <span className="block text-xs text-slate-400">PAN: {inv.customerPan}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{inv.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-rose-600 text-right">{inv.dueAmount > 0 ? inv.dueAmount.toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1">
                      <button 
                        onClick={() => { setSelectedInvoice(inv); setViewMode('VIEW'); }} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View & Print"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                         onClick={() => onDeleteInvoice(inv.id)}
                         className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                         title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
