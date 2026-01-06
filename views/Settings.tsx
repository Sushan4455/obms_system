
import React, { useState } from 'react';
import { Save, Building, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onClearData }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your company profile and application preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div>
          <div className="flex items-center space-x-2 mb-4 text-slate-900 font-bold text-lg">
            <Building size={20} className="text-blue-600" />
            <h3>Company Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Name</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PAN Number</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={formData.pan}
                onChange={e => setFormData({...formData, pan: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-2 mb-4 text-slate-900 font-bold text-lg">
            <Calendar size={20} className="text-blue-600" />
            <h3>Fiscal Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fiscal Year</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={formData.fiscalYear}
                onChange={e => setFormData({...formData, fiscalYear: e.target.value})}
              >
                <option value="2080/81">2080/81</option>
                <option value="2081/82">2081/82</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button type="submit" className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      <div className="bg-rose-50 p-8 rounded-2xl border border-rose-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-rose-900 text-lg">Danger Zone</h3>
            <p className="text-rose-700 text-sm mt-1 mb-4">
              Clearing data will remove all transactions, invoices, contacts, and settings from your local browser storage. This action cannot be undone.
            </p>
            <button 
              type="button" 
              onClick={() => { if(window.confirm('Are you sure? This will wipe all data.')) onClearData(); }}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-rose-300 text-rose-700 font-bold rounded-lg hover:bg-rose-100"
            >
              <RefreshCw size={16} />
              <span>Reset Application Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
