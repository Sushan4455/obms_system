
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum TransactionType {
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_MADE = 'PAYMENT_MADE',
  JOURNAL = 'JOURNAL',
  TDS_DEDUCTION = 'TDS_DEDUCTION'
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE'; // Legacy support
  amount: number;
  month: string;
  description: string;
  category: string;
  date: string;
  referenceId?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number; // Current balance (calculated)
  isSystem: boolean; // System accounts cannot be deleted (e.g., Accounts Receivable)
}

export interface Contact {
  id: string;
  name: string;
  pan: string;
  isVatRegistered: boolean;
  address: string;
  email: string;
  phone: string;
  type: 'CUSTOMER' | 'SUPPLIER';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  amount: number;
  isTaxable: boolean;
}

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ESEWA' | 'KHALTI' | 'FONEPAY';
  reference: string;
  note?: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string; 
  dueDate: string;
  contactId: string;
  customerName: string;
  customerPan: string;
  customerAddress: string;
  items: InvoiceItem[];
  subTotal: number;
  discountTotal: number;
  taxableAmount: number;
  nonTaxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  payments: Payment[];
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'VOID';
  type: 'TAX_INVOICE' | 'ABBREVIATED_INVOICE';
  fiscalYear: string;
  isPrinted: boolean;
}

export interface Purchase {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  vendorId: string;
  vendorName: string;
  vendorPan: string;
  vendorAddress: string;
  items: InvoiceItem[];
  subTotal: number;
  discountTotal: number;
  taxableAmount: number;
  nonTaxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  payments: Payment[];
  status: 'DRAFT' | 'RECEIVED' | 'PAID' | 'PARTIAL';
  fiscalYear: string;
  attachmentUrl?: string;
}

// --- New Staff Interfaces ---

export interface Staff {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  department: string;
  email: string;
  phone: string;
  salary: number;
  salaryType: 'MONTHLY' | 'HOURLY';
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  inTime: string; // HH:MM
  outTime?: string; // HH:MM
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE' | 'HALF_DAY';
  note?: string;
}

export interface WorkLog {
  id: string;
  staffId: string;
  date: string;
  title: string;
  description: string;
  project: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  managerComment?: string;
}

export interface AppSettings {
  companyName: string;
  address: string;
  pan: string;
  fiscalYear: string;
  currency: string;
  enableTds: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  vatPayable: number;
  receivables: number;
  payables: number;
  netProfit: number;
  cashBalance: number;
}

export interface JournalEntryLine {
  accountId: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
}
