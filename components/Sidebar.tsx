
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Users, 
  BookOpen, 
  Calculator, 
  Settings,
  PieChart,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales & Invoices', icon: FileText },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'contacts', label: 'Customers & Suppliers', icon: Users },
    { id: 'staff', label: 'Staff & HR', icon: Briefcase },
    { id: 'accounting', label: 'Accounting', icon: BookOpen },
    { id: 'tax', label: 'Tax Center (VAT/TDS)', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 h-full z-10">
      <div className="mb-10 px-2 flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl italic">L</div>
        <h1 className="text-xl font-bold tracking-tight">LekhaCloud</h1>
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-slate-800 rounded-xl">
        <p className="text-xs text-slate-400 mb-1">Fiscal Year 2080/81</p>
        <p className="text-sm font-semibold">Nepal Tech Pvt Ltd</p>
      </div>
    </div>
  );
};

export default Sidebar;
