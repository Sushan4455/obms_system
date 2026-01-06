
import React, { useState } from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Download, FileBarChart, Scale } from 'lucide-react';
import { Account, AccountType } from '../types';
import { generateProfitLoss, generateBalanceSheet } from '../services/accountingEngine';

interface ReportsProps {
  accounts: Account[];
  companyName: string;
}

const Reports: React.FC<ReportsProps> = ({ accounts, companyName }) => {
  const [activeTab, setActiveTab] = useState<'PL' | 'BS'>('PL');

  const pl = generateProfitLoss(accounts);
  const bs = generateBalanceSheet(accounts, pl.netProfit);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Reports</h2>
          <p className="text-slate-500">Real-time financial statements for {companyName}</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50">
          <Download size={18} />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="bg-slate-100 p-1 rounded-xl flex w-fit mb-6">
        <button
          onClick={() => setActiveTab('PL')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'PL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileBarChart size={18} />
          <span>Profit & Loss</span>
        </button>
        <button
          onClick={() => setActiveTab('BS')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'BS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Scale size={18} />
          <span>Balance Sheet</span>
        </button>
      </div>

      {activeTab === 'PL' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-2 text-emerald-600">
                <TrendingUp size={20} />
                <span className="font-bold">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">Rs. {pl.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-2 text-rose-600">
                <TrendingDown size={20} />
                <span className="font-bold">Total Expenses</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">Rs. {pl.totalExpense.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm text-white">
              <div className="flex items-center space-x-3 mb-2 text-blue-400">
                <DollarSign size={20} />
                <span className="font-bold">Net Profit</span>
              </div>
              <p className={`text-3xl font-bold ${pl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Rs. {pl.netProfit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900">Revenue Breakdown</h3>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    {pl.revenueAccounts.map(acc => (
                      <tr key={acc.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-slate-600 font-medium">{acc.name}</td>
                        <td className="py-3 text-right font-bold text-slate-900">Rs. {acc.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                    {pl.revenueAccounts.length === 0 && (
                      <tr><td colSpan={2} className="py-4 text-center text-slate-400">No revenue data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900">Expense Breakdown</h3>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                  {pl.expenseAccounts.map(acc => (
                      <tr key={acc.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-slate-600 font-medium">{acc.name}</td>
                        <td className="py-3 text-right font-bold text-slate-900">Rs. {acc.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                    {pl.expenseAccounts.length === 0 && (
                      <tr><td colSpan={2} className="py-4 text-center text-slate-400">No expense data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'BS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
               <div>
                 <h3 className="text-xl font-bold text-slate-900">Balance Sheet</h3>
                 <p className="text-sm text-slate-500">As of today</p>
               </div>
               <div className={`px-4 py-2 rounded-full text-xs font-bold ${bs.isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                 {bs.isBalanced ? 'BALANCED' : 'UNBALANCED'}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Assets */}
               <div>
                 <h4 className="text-lg font-bold text-slate-900 mb-4 bg-slate-50 p-2 rounded-lg">Assets</h4>
                 <table className="w-full mb-6">
                    <tbody>
                      {bs.assetAccounts.map(acc => (
                        <tr key={acc.id} className="border-b border-slate-50">
                          <td className="py-2 text-slate-600">{acc.name}</td>
                          <td className="py-2 text-right font-mono font-medium">{acc.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td className="py-3 font-bold text-slate-900">Total Assets</td>
                        <td className="py-3 text-right font-bold font-mono text-slate-900">{bs.totalAssets.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                 </table>
               </div>

               {/* Liabilities & Equity */}
               <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4 bg-slate-50 p-2 rounded-lg">Liabilities</h4>
                  <table className="w-full mb-6">
                    <tbody>
                      {bs.liabilityAccounts.map(acc => (
                        <tr key={acc.id} className="border-b border-slate-50">
                          <td className="py-2 text-slate-600">{acc.name}</td>
                          <td className="py-2 text-right font-mono font-medium">{acc.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200">
                        <td className="py-2 font-bold text-slate-700">Total Liabilities</td>
                        <td className="py-2 text-right font-bold font-mono text-slate-700">{bs.totalLiabilities.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                 </table>

                 <h4 className="text-lg font-bold text-slate-900 mb-4 bg-slate-50 p-2 rounded-lg">Equity</h4>
                  <table className="w-full mb-6">
                    <tbody>
                      {bs.equityAccounts.map(acc => (
                        <tr key={acc.id} className="border-b border-slate-50">
                          <td className="py-2 text-slate-600">{acc.name}</td>
                          <td className="py-2 text-right font-mono font-medium">{acc.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                       <tr className="border-b border-slate-50">
                          <td className="py-2 text-slate-600 italic">Net Profit (Current Period)</td>
                          <td className="py-2 text-right font-mono font-medium">{pl.netProfit.toLocaleString()}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200">
                        <td className="py-2 font-bold text-slate-700">Total Equity</td>
                        <td className="py-2 text-right font-bold font-mono text-slate-700">{bs.totalEquity.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                 </table>

                 <div className="mt-8 border-t-2 border-slate-900 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900 uppercase">Total Liabilities & Equity</span>
                    <span className="font-bold font-mono text-xl">{(bs.totalLiabilities + bs.totalEquity).toLocaleString()}</span>
                 </div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
