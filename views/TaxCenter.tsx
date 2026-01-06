
import React from 'react';
import { FileText, Calculator, Landmark, ShieldCheck } from 'lucide-react';
import { Account } from '../types';

interface TaxCenterProps {
  accounts: Account[];
}

const TaxCenter: React.FC<TaxCenterProps> = ({ accounts }) => {
  // 1004 = VAT Receivable, 2002 = VAT Payable
  const vatReceivable = accounts.find(a => a.id === '1004')?.balance || 0;
  const vatPayable = accounts.find(a => a.id === '2002')?.balance || 0;
  
  // 4001 = Sales Revenue
  const totalSales = accounts.find(a => a.id === '4001')?.balance || 0;
  // 5001 = COGS (Approx Purchases)
  const totalPurchases = accounts.find(a => a.id === '5001')?.balance || 0;

  const netVatPayable = vatPayable - vatReceivable;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tax Compliance Center</h2>
          <p className="text-slate-500">Manage VAT returns, TDS filings, and IRD reporting.</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center space-x-2">
            <ShieldCheck size={18} />
            <span>Verify Compliance Status</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">VAT Registry (Sales)</h3>
              <p className="text-sm text-slate-500">Automated Annex 7 output</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Taxable Sales (13%)</span>
              <span className="font-bold">Rs. {totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Export Sales (0%)</span>
              <span className="font-bold">Rs. 0</span>
            </div>
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-900 font-bold">Total VAT Collected (Output)</span>
              <span className="text-blue-900 font-bold">Rs. {vatPayable.toLocaleString()}</span>
            </div>
          </div>
          
          <button className="w-full py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all">
            Download Annex 7 (Sales Book)
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">VAT Registry (Purchase)</h3>
              <p className="text-sm text-slate-500">Automated Annex 8 output</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Taxable Purchases</span>
              <span className="font-bold">Rs. {totalPurchases.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Taxes on Import</span>
              <span className="font-bold">Rs. 0</span>
            </div>
            <div className="flex justify-between p-3 bg-rose-50 rounded-lg">
              <span className="text-rose-900 font-bold">Total VAT Credit (Input)</span>
              <span className="text-rose-900 font-bold">Rs. {vatReceivable.toLocaleString()}</span>
            </div>
          </div>
          
          <button className="w-full py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all">
            Download Annex 8 (Purchase Book)
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
              <Landmark size={14} />
              <span>Income Tax Estimate</span>
            </div>
            <h3 className="text-3xl font-bold">Annual Tax Liability</h3>
            <p className="text-slate-400 max-w-lg">
              Estimated corporate income tax based on current profit for the fiscal year.
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm font-medium mb-1">Net VAT Payable/Receivable</p>
            <p className={`text-4xl font-bold ${netVatPayable > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              Rs. {Math.abs(netVatPayable).toLocaleString()} {netVatPayable > 0 ? '(Due)' : '(Credit)'}
            </p>
            <button className="mt-4 px-6 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100">
              View Tax Planner
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <FileText size={18} />
            <span className="text-sm font-medium">Monthly TDS Summary</span>
          </div>
          <p className="text-xl font-bold">Rs. 0</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Pending Payment to IRD</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <FileText size={18} />
            <span className="text-sm font-medium">Unpaid VAT</span>
          </div>
          <p className="text-xl font-bold">Rs. {Math.max(0, netVatPayable).toLocaleString()}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">Due by 25th</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            <FileText size={18} />
            <span className="text-sm font-medium">Depreciation Provision</span>
          </div>
          <p className="text-xl font-bold">Rs. 0</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Automated Block-wise</p>
        </div>
      </div>
    </div>
  );
};

export default TaxCenter;
