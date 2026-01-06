
import React, { useState } from 'react';
import { BookOpen, List, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Account, JournalEntry, AccountType } from '../types';

interface AccountingProps {
  accounts: Account[];
  journals: JournalEntry[];
}

const Accounting: React.FC<AccountingProps> = ({ accounts, journals }) => {
  const [activeTab, setActiveTab] = useState<'COA' | 'GL'>('COA');
  const [searchTerm, setSearchTerm] = useState('');

  // Group accounts by type
  const groupedAccounts = {
    [AccountType.ASSET]: accounts.filter(a => a.type === AccountType.ASSET),
    [AccountType.LIABILITY]: accounts.filter(a => a.type === AccountType.LIABILITY),
    [AccountType.EQUITY]: accounts.filter(a => a.type === AccountType.EQUITY),
    [AccountType.REVENUE]: accounts.filter(a => a.type === AccountType.REVENUE),
    [AccountType.EXPENSE]: accounts.filter(a => a.type === AccountType.EXPENSE),
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id;

  const sortedJournals = [...journals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Accounting Engine</h2>
          <p className="text-slate-500">Double-entry bookkeeping, ledgers, and journals.</p>
        </div>
      </div>

      <div className="bg-white p-1 rounded-xl border border-slate-200 flex w-fit">
        <button
          onClick={() => setActiveTab('COA')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'COA' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <List size={18} />
          <span>Chart of Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab('GL')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'GL' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={18} />
          <span>General Ledger (Journals)</span>
        </button>
      </div>

      {activeTab === 'COA' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedAccounts).map(([type, accs]) => (
            <div key={type} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">{type}</h3>
                <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                  {accs.length} Accounts
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {accs.map(acc => (
                  <div key={acc.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{acc.code}</span>
                        <span className="font-medium text-slate-900">{acc.name}</span>
                      </div>
                    </div>
                    <span className={`font-bold font-mono ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      Rs. {Math.abs(acc.balance).toLocaleString()} {acc.balance < 0 ? 'Dr' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'GL' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Journal Entries</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search description..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3 text-right">Debit</th>
                  <th className="px-6 py-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedJournals.map(entry => (
                  <React.Fragment key={entry.id}>
                    {entry.lines.map((line, idx) => (
                      <tr key={`${entry.id}-${idx}`} className="hover:bg-slate-50 group">
                        <td className="px-6 py-2 text-slate-500">
                          {idx === 0 ? entry.date : ''}
                        </td>
                        <td className="px-6 py-2 text-slate-500 font-mono text-xs">
                           {idx === 0 ? entry.reference : ''}
                        </td>
                         <td className="px-6 py-2 font-medium text-slate-900">
                           {idx === 0 ? entry.description : ''}
                        </td>
                        <td className="px-6 py-2 text-slate-600">
                          {getAccountName(line.accountId)}
                        </td>
                        <td className="px-6 py-2 text-right font-mono text-slate-600">
                          {line.debit > 0 ? line.debit.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-2 text-right font-mono text-slate-600">
                          {line.credit > 0 ? line.credit.toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/50 border-b border-slate-200"><td colSpan={6} className="h-2"></td></tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
