
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Sales from './views/Sales';
import Purchases from './views/Purchases';
import Contacts from './views/Contacts';
import Staff from './views/Staff';
import Reports from './views/Reports';
import TaxCenter from './views/TaxCenter';
import Settings from './views/Settings';
import Accounting from './views/Accounting';
import WebsiteBuilder from './views/WebsiteBuilder';
import Ecommerce from './views/Ecommerce';
import Toast from './components/Toast';
import { Bell, Search as SearchIcon, Landmark } from 'lucide-react';
import { 
  INITIAL_INVOICES, 
  INITIAL_PURCHASES, 
  INITIAL_CONTACTS, 
  DEFAULT_SETTINGS,
  INITIAL_ACCOUNTS,
  INITIAL_STAFF,
  INITIAL_ATTENDANCE,
  INITIAL_WORK_LOGS,
  INITIAL_PRODUCTS,
  INITIAL_WEBSITE_CONFIG,
  NEPALI_MONTHS 
} from './constants';
import { 
  Transaction, Invoice, Purchase, Contact, AppSettings, Notification, 
  Payment, Account, JournalEntry, Staff as StaffType, Attendance, WorkLog,
  Product, WebsiteConfig
} from './types';
import { 
  createInvoiceJournal, 
  createPaymentJournal, 
  createPurchaseJournal, 
  createPurchasePaymentJournal, 
  calculateAccountBalances 
} from './services/accountingEngine';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [notification, setNotification] = useState<Notification | null>(null);

  // --- State with LocalStorage Persistence ---
  
  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('lc_journals');
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('lc_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('lc_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('lc_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('lc_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [staffList, setStaffList] = useState<StaffType[]>(() => {
    const saved = localStorage.getItem('lc_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('lc_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() => {
    const saved = localStorage.getItem('lc_worklogs');
    return saved ? JSON.parse(saved) : INITIAL_WORK_LOGS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(() => {
    const saved = localStorage.getItem('lc_website_config');
    return saved ? JSON.parse(saved) : INITIAL_WEBSITE_CONFIG;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('lc_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('lc_journals', JSON.stringify(journals)), [journals]);
  useEffect(() => localStorage.setItem('lc_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('lc_invoices', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('lc_purchases', JSON.stringify(purchases)), [purchases]);
  useEffect(() => localStorage.setItem('lc_contacts', JSON.stringify(contacts)), [contacts]);
  useEffect(() => localStorage.setItem('lc_staff', JSON.stringify(staffList)), [staffList]);
  useEffect(() => localStorage.setItem('lc_attendance', JSON.stringify(attendance)), [attendance]);
  useEffect(() => localStorage.setItem('lc_worklogs', JSON.stringify(workLogs)), [workLogs]);
  useEffect(() => localStorage.setItem('lc_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('lc_website_config', JSON.stringify(websiteConfig)), [websiteConfig]);
  useEffect(() => localStorage.setItem('lc_settings', JSON.stringify(settings)), [settings]);

  // --- Recalculate Balances when Journals Change ---
  useEffect(() => {
    const updatedAccounts = calculateAccountBalances(INITIAL_ACCOUNTS, journals);
    setAccounts(updatedAccounts);
  }, [journals]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ id: Date.now().toString(), message, type });
  };

  // --- Data Handlers ---

  const handleAddInvoice = (newInvoice: Invoice) => {
    // 1. Deduct Inventory if applicable
    if (newInvoice.source === 'ONLINE_STORE') {
        setProducts(prev => prev.map(p => {
            const item = newInvoice.items.find(i => i.productId === p.id);
            if (item) {
                return { ...p, stock: Math.max(0, p.stock - item.quantity) };
            }
            return p;
        }));
    }

    // 2. Add Invoice
    setInvoices(prev => [newInvoice, ...prev]);
    
    // 3. Post to Journal
    const journal = createInvoiceJournal(newInvoice);
    setJournals(prev => [...prev, journal]);
    
    showToast(newInvoice.source === 'ONLINE_STORE' ? 'Online Order Received!' : 'Invoice created and posted to Ledger');
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    setJournals(prev => prev.filter(j => j.reference !== id)); 
    showToast('Invoice deleted', 'info');
  };

  const handleAddPayment = (payment: Payment, invoiceId: string) => {
    let targetInvoiceNumber = '';
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        targetInvoiceNumber = inv.number;
        const newPaid = (inv.paidAmount || 0) + payment.amount;
        const newDue = inv.totalAmount - newPaid;
        const newStatus = newDue <= 0.5 ? 'PAID' : 'PARTIAL';
        return { ...inv, paidAmount: newPaid, dueAmount: Math.max(0, newDue), payments: [...(inv.payments || []), payment], status: newStatus };
      }
      return inv;
    }));

    if(targetInvoiceNumber) {
        const journal = createPaymentJournal(payment, targetInvoiceNumber);
        setJournals(prev => [...prev, journal]);
    }
    showToast(`Payment of Rs. ${payment.amount} recorded`, 'success');
  };

  const handleAddPurchase = (newPurchase: Purchase) => {
    setPurchases(prev => [newPurchase, ...prev]);
    const journal = createPurchaseJournal(newPurchase);
    setJournals(prev => [...prev, journal]);
    showToast('Purchase bill recorded and posted to Ledger');
  };

  const handleAddPurchasePayment = (payment: Payment, billId: string) => {
    let targetBillNumber = '';
    setPurchases(prev => prev.map(bill => {
      if (bill.id === billId) {
        targetBillNumber = bill.number;
        const newPaid = (bill.paidAmount || 0) + payment.amount;
        const newDue = bill.totalAmount - newPaid;
        const newStatus = newDue <= 0.5 ? 'PAID' : 'PARTIAL';
        return { ...bill, paidAmount: newPaid, dueAmount: Math.max(0, newDue), payments: [...(bill.payments || []), payment], status: newStatus };
      }
      return bill;
    }));

     if(targetBillNumber) {
        const journal = createPurchasePaymentJournal(payment, targetBillNumber);
        setJournals(prev => [...prev, journal]);
    }
    showToast(`Payment of Rs. ${payment.amount} recorded`, 'success');
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    setJournals(prev => prev.filter(j => !j.id.includes(id))); 
    showToast('Purchase bill deleted', 'info');
  };

  const handleAddContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    showToast('Contact saved');
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    showToast('Contact deleted', 'info');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    showToast('Settings updated');
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- Dashboard Logic Derived from Accounts ---
  const dashboardData = useMemo(() => {
    const totalSales = accounts.find(a => a.id === '4001')?.balance || 0;
    const totalExpenses = accounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + a.balance, 0);
    const receivables = accounts.find(a => a.id === '1003')?.balance || 0;
    const payables = accounts.find(a => a.id === '2001')?.balance || 0;
    const cashBalance = (accounts.find(a => a.id === '1001')?.balance || 0) + (accounts.find(a => a.id === '1002')?.balance || 0);
    const vatPayable = (accounts.find(a => a.id === '2002')?.balance || 0) - (accounts.find(a => a.id === '1004')?.balance || 0);
    const chartData = NEPALI_MONTHS.map(m => ({ name: m, income: 0, expense: 0 }));

    return { 
      stats: { totalSales, totalExpenses, vatPayable, receivables, payables, netProfit: totalSales - totalExpenses, cashBalance }, 
      chartData 
    };
  }, [accounts]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': 
        return <Dashboard stats={dashboardData.stats} chartData={dashboardData.chartData} onAddTransaction={() => {}} />;
      case 'sales': 
        return (
          <Sales 
            invoices={invoices} 
            contacts={contacts}
            onAddInvoice={handleAddInvoice} 
            onDeleteInvoice={handleDeleteInvoice}
            onAddPayment={handleAddPayment}
            fiscalYear={settings.fiscalYear}
            settings={settings}
          />
        );
      case 'purchases':
        return (
          <Purchases 
            purchases={purchases} 
            contacts={contacts}
            onAddPurchase={handleAddPurchase} 
            onDeletePurchase={handleDeletePurchase}
            onAddPayment={handleAddPurchasePayment}
            fiscalYear={settings.fiscalYear}
            settings={settings}
          />
        );
      case 'ecommerce':
          return (
              <WebsiteBuilder 
                products={products}
                onUpdateProducts={setProducts}
                config={websiteConfig}
                onUpdateConfig={setWebsiteConfig}
                onPreviewStore={() => setActiveView('storefront')}
              />
          );
      case 'storefront':
          return (
              <Ecommerce 
                 config={websiteConfig}
                 products={products}
                 onPlaceOrder={handleAddInvoice}
                 fiscalYear={settings.fiscalYear}
                 onExit={() => setActiveView('ecommerce')}
              />
          );
      case 'contacts':
        return <Contacts contacts={contacts} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} />;
      case 'staff':
        return (
          <Staff 
            staffList={staffList}
            attendance={attendance}
            workLogs={workLogs}
            onAddStaff={(s) => setStaffList(prev => [...prev, s])}
            onUpdateAttendance={(a) => {
              // Update existing or add new
              const existingIdx = attendance.findIndex(att => att.id === a.id);
              if (existingIdx >= 0) {
                 const newAtt = [...attendance];
                 newAtt[existingIdx] = a;
                 setAttendance(newAtt);
              } else {
                 setAttendance(prev => [a, ...prev]);
              }
            }}
            onAddWorkLog={(w) => setWorkLogs(prev => [w, ...prev])}
            onUpdateWorkLog={(w) => {
               setWorkLogs(prev => prev.map(log => log.id === w.id ? w : log));
            }}
          />
        );
      case 'accounting':
        return <Accounting accounts={accounts} journals={journals} />;
      case 'reports':
        return <Reports accounts={accounts} companyName={settings.companyName} />;
      case 'settings':
        return <Settings settings={settings} onSave={handleSaveSettings} onClearData={handleClearData} />;
      case 'tax': 
        return <TaxCenter accounts={accounts} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      {activeView !== 'storefront' && <Sidebar activeView={activeView} setActiveView={setActiveView} />}
      
      <main className={`flex-1 ${activeView !== 'storefront' ? 'ml-64 p-8' : ''} overflow-y-auto h-screen scrollbar-hide print:ml-0 print:p-0`}>
        {activeView !== 'storefront' && (
             <header className="flex justify-between items-center mb-8 bg-white/50 backdrop-blur-md sticky top-0 z-20 py-4 -mt-4 border-b border-slate-100 print:hidden">
             <div className="flex items-center space-x-4">
               <div className="relative">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search anything..." 
                   className="pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all focus:w-80"
                 />
               </div>
             </div>
             
             <div className="flex items-center space-x-4">
               <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-slate-900 leading-none">{settings.companyName}</p>
                 <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-1">FY {settings.fiscalYear}</p>
               </div>
               <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors relative">
                 <Bell size={20} />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
               </button>
               <div className="h-8 w-px bg-slate-200 mx-2"></div>
               <div className="w-10 h-10 bg-slate-200 rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden">
                 <img src="https://picsum.photos/40/40?random=1" alt="Avatar" className="w-full h-full object-cover" />
               </div>
             </div>
           </header>
        )}

        {renderView()}
        
        {activeView !== 'storefront' && (
             <footer className="mt-16 pt-8 border-t border-slate-200 text-slate-400 text-xs flex justify-between print:hidden">
             <p>© 2024 LekhaCloud Nepal. Cloud SaaS Mode.</p>
             <div className="flex space-x-4">
               <a href="#" className="hover:text-slate-600">Privacy Policy</a>
               <a href="#" className="hover:text-slate-600">Support</a>
             </div>
           </footer>
        )}
      </main>

      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default App;
