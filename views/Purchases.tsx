
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Trash2, X, PlusCircle, MinusCircle, 
  ShoppingBag, Eye, Printer, ArrowLeft, Download, CreditCard,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Purchase, InvoiceItem, Contact, Payment, AppSettings } from '../types';
import { VAT_RATE } from '../constants';

interface PurchasesProps {
  purchases: Purchase[];
  contacts: Contact[];
  onAddPurchase: (purchase: Purchase) => void;
  onDeletePurchase: (id: string) => void;
  onAddPayment: (payment: Payment, billId: string) => void;
  fiscalYear: string;
  settings: AppSettings;
}

const Purchases: React.FC<PurchasesProps> = ({ 
  purchases, 
  contacts, 
  onAddPurchase, 
  onDeletePurchase,
  onAddPayment,
  fiscalYear,
  settings
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'VIEW'>('LIST');
  const [selectedBill, setSelectedBill] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState<Partial<Purchase>>({
    vendorName: '',
    vendorPan: '',
    vendorAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    number: '',
    items: [],
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
  const calculateTotals = (items: InvoiceItem[]) => {
    let subTotal = 0;
    let taxableAmount = 0;
    let nonTaxableAmount = 0;
    let discountTotal = 0;

    items.forEach(item => {
      subTotal += item.amount;
      discountTotal += item.discount || 0;
      if (item.isTaxable) {
        taxableAmount += item.amount;
      } else {
        nonTaxableAmount += item.amount;
      }
    });

    const vatAmount = taxableAmount * VAT_RATE;
    const totalAmount = subTotal + vatAmount;

    return { subTotal, taxableAmount, nonTaxableAmount, vatAmount, totalAmount, discountTotal };
  };

  // --- Handlers ---

  const handleDownloadPDF = async () => {
      const input = document.getElementById('purchase-bill-template');
      if (!input) {
        alert('Bill template not found');
        return;
      }
      
      try {
        const canvas = await html2canvas(input, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        const imgWidth = 210; 
        const pageHeight = 297; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`PurchaseBill-${selectedBill?.number || 'Draft'}.pdf`);
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
        vendorId: contact.id,
        vendorName: contact.name,
        vendorPan: contact.pan,
        vendorAddress: contact.address
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

  const savePurchase = () => {
    const items = formData.items || [];
    const totals = calculateTotals(items);
    
    const newPurchase: Purchase = {
      id: `PUR-${Date.now()}`,
      number: formData.number || `BILL-${Date.now()}`, // Use entered Bill No or generate temp
      fiscalYear,
      date: formData.date!,
      dueDate: formData.dueDate!,
      vendorId: formData.vendorId || 'unknown',
      vendorName: formData.vendorName || 'General Supplier',
      vendorPan: formData.vendorPan || '',
      vendorAddress: formData.vendorAddress || '',
      items: items,
      ...totals,
      paidAmount: 0,
      dueAmount: totals.totalAmount,
      payments: [],
      status: 'RECEIVED',
    };

    onAddPurchase(newPurchase);
    setViewMode('LIST');
    setFormData({ items: [] });
  };

  const submitPayment = () => {
    if (!selectedBill) return;
    
    const payment: Payment = {
      id: `PAYOUT-${Date.now()}`,
      invoiceId: selectedBill.id,
      date: paymentData.date!,
      amount: Number(paymentData.amount),
      method: paymentData.method as any,
      reference: paymentData.reference || ''
    };

    onAddPayment(payment, selectedBill.id);
    setIsPaymentModalOpen(false);
  };

  const totals = calculateTotals(formData.items || []);

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const purchaseStats = useMemo(() => {
    return {
      totalPurchases: purchases.reduce((acc, p) => acc + p.totalAmount, 0),
      vatPaid: purchases.reduce((acc, p) => acc + p.vatAmount, 0),
      outstandingDue: purchases.reduce((acc, p) => acc + p.dueAmount, 0),
      paidCount: purchases.filter(p => p.status === 'PAID').length
    };
  }, [purchases]);


  // --- Render Views ---

  if (viewMode === 'CREATE') {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Record Purchase Bill</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
          {/* Vendor & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Vendor / Supplier</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                onChange={handleContactSelect}
                defaultValue=""
              >
                <option value="" disabled>Select Existing Supplier</option>
                {contacts.filter(c => c.type === 'SUPPLIER').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input 
                placeholder="Vendor Name" 
                className="w-full p-3 border border-slate-200 rounded-xl"
                value={formData.vendorName}
                onChange={e => setFormData({...formData, vendorName: e.target.value})}
              />
              <div className="flex space-x-4">
                <input 
                  placeholder="PAN / VAT No" 
                  className="w-full p-3 border border-slate-200 rounded-xl"
                  value={formData.vendorPan}
                  onChange={e => setFormData({...formData, vendorPan: e.target.value})}
                />
                <input 
                  placeholder="Address" 
                  className="w-full p-3 border border-slate-200 rounded-xl"
                  value={formData.vendorAddress}
                  onChange={e => setFormData({...formData, vendorAddress: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Bill Details</label>
              <input 
                  placeholder="Supplier Bill Number" 
                  className="w-full p-3 border border-slate-200 rounded-xl font-mono"
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                />
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Bill Date</label>
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
              <div className="p-4 bg-slate-100 rounded-xl">
                 <p className="text-xs text-slate-500 font-bold uppercase">Fiscal Year</p>
                 <p className="text-lg font-bold text-slate-800">{fiscalYear}</p>
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
              onClick={savePurchase}
              disabled={formData.items?.length === 0 || !formData.number}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Record Bill
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'VIEW' && selectedBill) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6 print:hidden">
           <button onClick={() => setViewMode('LIST')} className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft size={20} /> <span>Back to Purchases</span>
          </button>
          <div className="flex space-x-3">
            {selectedBill.status !== 'PAID' && (
              <button 
                onClick={() => {
                   setPaymentData({ ...paymentData, amount: selectedBill.dueAmount });
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
              <Printer size={18} /> <span>Print Bill</span>
            </button>
          </div>
        </div>

        {/* Bill Viewer / Print Layout */}
        <div id="purchase-bill-template" className="bg-white p-10 max-w-[210mm] mx-auto shadow-lg print:shadow-none print:p-0 print:max-w-none text-black">
          <div className="border-b border-black pb-4 mb-6 flex justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-400 uppercase">Purchase Bill Record</h1>
              <p className="font-bold text-2xl mt-1">{selectedBill.vendorName}</p>
              <p>{selectedBill.vendorAddress}</p>
              <p>PAN: {selectedBill.vendorPan}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase text-slate-500">Bill No.</p>
              <p className="text-xl font-mono font-bold">{selectedBill.number}</p>
              <p className="text-sm mt-2">Date: {selectedBill.date}</p>
              <p className="text-sm">Due Date: {selectedBill.dueDate}</p>
            </div>
          </div>

          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Bill To (Our Company)</p>
            <p className="font-bold">{settings.companyName}</p>
            <p>{settings.address}</p>
            <p>PAN: {settings.pan}</p>
          </div>

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
              {selectedBill.items.map((item, idx) => (
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

          <div className="flex justify-end mb-8">
            <div className="w-64 border border-black text-sm">
               <div className="flex justify-between p-2 border-b border-black">
                 <span>Sub Total</span>
                 <span className="font-bold">{selectedBill.subTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-b border-black">
                 <span>Discount</span>
                 <span>{selectedBill.discountTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-b border-black">
                 <span>Taxable Amount</span>
                 <span>{selectedBill.taxableAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-b border-black">
                 <span>VAT (13%)</span>
                 <span>{selectedBill.vatAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 bg-gray-100 font-bold text-base">
                 <span>Grand Total</span>
                 <span>{selectedBill.totalAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-t border-black text-emerald-700 font-bold">
                 <span>Paid Amount</span>
                 <span>{selectedBill.paidAmount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between p-2 border-t border-black text-rose-700 font-bold">
                 <span>Due Amount</span>
                 <span>{selectedBill.dueAmount.toFixed(2)}</span>
               </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-12">
            <p>Internal Record - LekhaCloud Nepal</p>
          </div>
        </div>

        {/* Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold mb-4">Record Outgoing Payment</h3>
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Paid</label>
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
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reference</label>
                   <input 
                    className="w-full p-3 border rounded-xl"
                    value={paymentData.reference}
                    onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                    placeholder="e.g. Cheque No"
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
                <button onClick={submitPayment} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Confirm Payment</button>
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
          <h2 className="text-2xl font-bold text-slate-900">Purchases & Expenses</h2>
          <p className="text-slate-500">Track bills, supplier payments and expenses.</p>
        </div>
        <button 
          onClick={() => setViewMode('CREATE')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-shadow shadow-md"
        >
          <Plus size={18} />
          <span>Record New Bill</span>
        </button>
      </div>

       {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Purchases</p>
          <p className="text-xl font-bold text-slate-900">Rs. {purchaseStats.totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Input VAT Paid</p>
          <p className="text-xl font-bold text-blue-600">Rs. {purchaseStats.vatPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Payable Due</p>
          <p className="text-xl font-bold text-rose-600">Rs. {purchaseStats.outstandingDue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Bills Cleared</p>
          <p className="text-xl font-bold text-emerald-600">{purchaseStats.paidCount} <span className="text-sm font-medium text-slate-400">Bills</span></p>
        </div>
      </div>

       {/* Filters */}
      <div className="flex space-x-4 bg-white p-2 rounded-xl border border-slate-200 w-fit">
        {['ALL', 'RECEIVED', 'PAID', 'PARTIAL'].map(status => (
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
              placeholder="Search Bill No or Vendor..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bill #</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Due</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{purchase.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{purchase.number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {purchase.vendorName}
                      {purchase.vendorPan && <span className="block text-xs text-slate-400">PAN: {purchase.vendorPan}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      {purchase.totalAmount.toLocaleString()}
                    </td>
                     <td className="px-6 py-4 text-sm font-medium text-rose-600 text-right">{purchase.dueAmount > 0 ? purchase.dueAmount.toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${purchase.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end space-x-1">
                          <button 
                            onClick={() => { setSelectedBill(purchase); setViewMode('VIEW'); }} 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View & Print"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => onDeletePurchase(purchase.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <ShoppingBag size={32} className="mb-2 opacity-50" />
                      <p>No purchase records found.</p>
                    </div>
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

export default Purchases;
