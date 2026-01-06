
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  X,
  Calendar,
  Tag,
  Banknote
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { NEPALI_MONTHS } from '../constants';
import { Transaction } from '../types';

interface DashboardProps {
  stats: {
    totalSales: number;
    totalExpenses: number;
    vatPayable: number;
    cashBalance: number;
  };
  chartData: any[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const StatCard = ({ title, amount, trend, trendUp, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trend}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1 text-slate-900">Rs. {amount.toLocaleString()}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, chartData, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: '',
    month: 'Poush',
    description: '',
    category: 'General'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      type: formData.type,
      amount: Number(formData.amount),
      month: formData.month,
      description: formData.description,
      category: formData.category,
      date: new Date().toISOString()
    });
    setIsModalOpen(false);
    setFormData({ ...formData, amount: '', description: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Namaste, Suman!</h2>
          <p className="text-slate-500">Here's what's happening with your business today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Export PDF</button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          amount={stats.totalSales} 
          trend="+12.5%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Expenses" 
          amount={stats.totalExpenses} 
          trend="-2.1%" 
          trendUp={false} 
          icon={TrendingDown} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Net VAT Payable" 
          amount={stats.vatPayable} 
          trend="+4.3%" 
          trendUp={false} 
          icon={Receipt} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Cash Balance" 
          amount={stats.cashBalance} 
          trend="+8.2%" 
          trendUp={true} 
          icon={Wallet} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Tax Liability (Current)</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">VAT (Sales)</span>
                <span className="font-semibold">Rs. {(stats.totalSales * 0.13).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-[80%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">VAT (Purchase Credit)</span>
                <span className="font-semibold">Rs. {(stats.totalExpenses * 0.13).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[40%]"></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-bold">Estimated Net Payable</span>
                <span className="text-xl font-bold text-rose-600">Rs. {stats.vatPayable.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Calculated for the period of Shrawan 2080.</p>
              <button className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800">
                File VAT Return
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Add New Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-slate-100 p-1 rounded-lg flex">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${formData.type === 'INCOME' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                >
                  Expense
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Amount</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Fiscal Month</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
                    >
                      {NEPALI_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="E.g. Payment for Invoice #001"
                ></textarea>
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
