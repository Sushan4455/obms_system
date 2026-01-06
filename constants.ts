
import { AccountType, Transaction, Invoice, Contact, Purchase, AppSettings, Account, Staff, Attendance, WorkLog } from './types';

export const VAT_RATE = 0.13;
export const FISCAL_YEAR_START = 'Shrawan';
export const FISCAL_YEAR_END = 'Ashad';

export const NEPALI_MONTHS = [
  'Shrawan', 'Bhadra', 'Ashoj', 'Kartik', 'Mangsir', 'Poush', 
  'Magh', 'Falgun', 'Chaitra', 'Baishakh', 'Jestha', 'Ashadh'
];

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'My Nepal Business Pvt Ltd',
  address: 'Kathmandu, Nepal',
  pan: '600000000',
  fiscalYear: '2080/81',
  currency: 'NPR',
  enableTds: true
};

// Standard Chart of Accounts for Nepali SME
export const INITIAL_ACCOUNTS: Account[] = [
  // Assets (1000-1999)
  { id: '1001', code: '1001', name: 'Cash on Hand', type: AccountType.ASSET, balance: 0, isSystem: true },
  { id: '1002', code: '1002', name: 'Bank Accounts', type: AccountType.ASSET, balance: 0, isSystem: true },
  { id: '1003', code: '1003', name: 'Accounts Receivable', type: AccountType.ASSET, balance: 0, isSystem: true },
  { id: '1004', code: '1004', name: 'VAT Receivable', type: AccountType.ASSET, balance: 0, isSystem: true }, // Input VAT
  { id: '1005', code: '1005', name: 'Inventory / Stock', type: AccountType.ASSET, balance: 0, isSystem: false },
  
  // Liabilities (2000-2999)
  { id: '2001', code: '2001', name: 'Accounts Payable', type: AccountType.LIABILITY, balance: 0, isSystem: true },
  { id: '2002', code: '2002', name: 'VAT Payable', type: AccountType.LIABILITY, balance: 0, isSystem: true }, // Output VAT
  { id: '2003', code: '2003', name: 'TDS Payable', type: AccountType.LIABILITY, balance: 0, isSystem: true },

  // Equity (3000-3999)
  { id: '3001', code: '3001', name: 'Owner\'s Equity', type: AccountType.EQUITY, balance: 0, isSystem: true },
  { id: '3002', code: '3002', name: 'Retained Earnings', type: AccountType.EQUITY, balance: 0, isSystem: true },

  // Revenue (4000-4999)
  { id: '4001', code: '4001', name: 'Sales Revenue', type: AccountType.REVENUE, balance: 0, isSystem: true },
  { id: '4002', code: '4002', name: 'Other Income', type: AccountType.REVENUE, balance: 0, isSystem: false },

  // Expenses (5000-5999)
  { id: '5001', code: '5001', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, balance: 0, isSystem: true },
  { id: '5002', code: '5002', name: 'Rent Expense', type: AccountType.EXPENSE, balance: 0, isSystem: false },
  { id: '5003', code: '5003', name: 'Salary & Wages', type: AccountType.EXPENSE, balance: 0, isSystem: false },
  { id: '5004', code: '5004', name: 'Utilities', type: AccountType.EXPENSE, balance: 0, isSystem: false },
  { id: '5005', code: '5005', name: 'Office Supplies', type: AccountType.EXPENSE, balance: 0, isSystem: false },
];

export const INITIAL_TRANSACTIONS: Transaction[] = []; // Cleared to use Journals instead

export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Himalayan Traders Pvt Ltd',
    pan: '601234567',
    isVatRegistered: true,
    address: 'New Road, Kathmandu',
    email: 'accounts@himalayantraders.com',
    phone: '9851000000',
    type: 'CUSTOMER'
  },
  {
    id: 's1',
    name: 'Nepal Office Supplies',
    pan: '300000001',
    isVatRegistered: true,
    address: 'Putalisadak, Kathmandu',
    email: 'sales@nos.com.np',
    phone: '01-4400000',
    type: 'SUPPLIER'
  }
];

export const TDS_RATES = {
  RENT: 0.10,
  CONSULTANCY: 0.15,
  CONTRACT: 0.015,
  SALARY: 0.01,
};

// --- Staff Initial Data ---

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'emp1',
    name: 'Suman Shrestha',
    role: 'ADMIN',
    department: 'Management',
    email: 'suman@example.com',
    phone: '9800000000',
    salary: 50000,
    salaryType: 'MONTHLY',
    joiningDate: '2023-01-01',
    status: 'ACTIVE',
    avatar: 'https://ui-avatars.com/api/?name=Suman+Shrestha&background=0D8ABC&color=fff'
  },
  {
    id: 'emp2',
    name: 'Rita Thapa',
    role: 'STAFF',
    department: 'Sales',
    email: 'rita@example.com',
    phone: '9800000001',
    salary: 25000,
    salaryType: 'MONTHLY',
    joiningDate: '2023-06-15',
    status: 'ACTIVE',
    avatar: 'https://ui-avatars.com/api/?name=Rita+Thapa&background=E11D48&color=fff'
  }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  {
    id: 'att1',
    staffId: 'emp1',
    date: new Date().toISOString().split('T')[0],
    inTime: '09:00',
    status: 'PRESENT'
  }
];

export const INITIAL_WORK_LOGS: WorkLog[] = [];
