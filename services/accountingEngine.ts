
import { Invoice, Payment, JournalEntry, Account, AccountType, Purchase } from '../types';

// --- Journal Generators ---

export const createInvoiceJournal = (invoice: Invoice): JournalEntry => {
  const { totalAmount, taxableAmount, nonTaxableAmount, vatAmount, number, date, customerName } = invoice;
  const salesRevenue = taxableAmount + nonTaxableAmount;

  return {
    id: `JE-INV-${invoice.id}`,
    date,
    reference: number,
    description: `Sales Invoice #${number} - ${customerName}`,
    lines: [
      { accountId: '1003', debit: totalAmount, credit: 0 }, // Dr Accounts Receivable
      { accountId: '4001', debit: 0, credit: salesRevenue }, // Cr Sales Revenue
      { accountId: '2002', debit: 0, credit: vatAmount },    // Cr VAT Payable
    ]
  };
};

export const createPaymentJournal = (payment: Payment, invoiceNumber: string): JournalEntry => {
  let assetAccountId = '1001'; // Default Cash
  if (['BANK_TRANSFER', 'CHEQUE', 'ESEWA', 'KHALTI', 'FONEPAY'].includes(payment.method)) {
    assetAccountId = '1002'; // Bank
  }

  return {
    id: `JE-PAY-${payment.id}`,
    date: payment.date,
    reference: payment.reference || 'PAYMENT',
    description: `Payment Received for ${invoiceNumber}`,
    lines: [
      { accountId: assetAccountId, debit: payment.amount, credit: 0 }, // Dr Cash/Bank
      { accountId: '1003', debit: 0, credit: payment.amount },         // Cr Accounts Receivable
    ]
  };
};

export const createPurchaseJournal = (bill: Purchase): JournalEntry => {
  const { totalAmount, taxableAmount, nonTaxableAmount, vatAmount, number, date, vendorName } = bill;
  const expenseAmount = taxableAmount + nonTaxableAmount;
  
  // Decide Expense Account (Defaulting to COGS/Inventory for simplicity, but could be selectable)
  const expenseAccountId = '5001'; 

  return {
    id: `JE-PUR-${bill.id}`,
    date,
    reference: number,
    description: `Purchase Bill #${number} - ${vendorName}`,
    lines: [
      { accountId: expenseAccountId, debit: expenseAmount, credit: 0 }, // Dr Expense/Inventory
      { accountId: '1004', debit: vatAmount, credit: 0 },               // Dr VAT Receivable
      { accountId: '2001', debit: 0, credit: totalAmount },             // Cr Accounts Payable
    ]
  };
};

export const createPurchasePaymentJournal = (payment: Payment, billNumber: string): JournalEntry => {
  let assetAccountId = '1001'; // Default Cash
  if (['BANK_TRANSFER', 'CHEQUE', 'ESEWA', 'KHALTI', 'FONEPAY'].includes(payment.method)) {
    assetAccountId = '1002'; // Bank
  }

  return {
    id: `JE-PAYOUT-${payment.id}`,
    date: payment.date,
    reference: payment.reference || 'PAYOUT',
    description: `Payment Made for Bill #${billNumber}`,
    lines: [
      { accountId: '2001', debit: payment.amount, credit: 0 },         // Dr Accounts Payable
      { accountId: assetAccountId, debit: 0, credit: payment.amount }, // Cr Cash/Bank
    ]
  };
};

// --- Engine Logic ---

/**
 * Calculates current balances for all accounts based on Journal Entries.
 */
export const calculateAccountBalances = (accounts: Account[], journals: JournalEntry[]): Account[] => {
  // Create a map for O(1) lookups
  const accountMap = new Map(accounts.map(a => [a.id, { ...a, balance: 0 }]));

  journals.forEach(entry => {
    entry.lines.forEach(line => {
      const account = accountMap.get(line.accountId);
      if (account) {
        if ([AccountType.ASSET, AccountType.EXPENSE].includes(account.type)) {
          // Normal Debit Balance: Debit increases, Credit decreases
          account.balance += (line.debit - line.credit);
        } else {
          // Normal Credit Balance: Credit increases, Debit decreases
          account.balance += (line.credit - line.debit);
        }
      }
    });
  });

  return Array.from(accountMap.values());
};

/**
 * Generates data for Profit & Loss Statement
 */
export const generateProfitLoss = (accounts: Account[]) => {
  const revenueAccounts = accounts.filter(a => a.type === AccountType.REVENUE);
  const expenseAccounts = accounts.filter(a => a.type === AccountType.EXPENSE);

  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalExpense = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
  const netProfit = totalRevenue - totalExpense;

  return {
    revenueAccounts,
    expenseAccounts,
    totalRevenue,
    totalExpense,
    netProfit
  };
};

/**
 * Generates data for Balance Sheet
 */
export const generateBalanceSheet = (accounts: Account[], netProfit: number) => {
  const assetAccounts = accounts.filter(a => a.type === AccountType.ASSET);
  const liabilityAccounts = accounts.filter(a => a.type === AccountType.LIABILITY);
  const equityAccounts = accounts.filter(a => a.type === AccountType.EQUITY);

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  let totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Add Net Profit to Retained Earnings (or Equity generally) for the report balance
  totalEquity += netProfit;

  return {
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    totalAssets,
    totalLiabilities,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 // Tolerance for floating point
  };
};
