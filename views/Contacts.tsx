
import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Trash2, Edit2, Users, Truck } from 'lucide-react';
import { Contact } from '../types';

interface ContactsProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onAddContact, onDeleteContact }) => {
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '', pan: '', email: '', phone: '', address: '', type: 'CUSTOMER'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact({
      id: `CT-${Date.now()}`,
      isVatRegistered: formData.pan?.length === 9, // Simple assumption for demo
      type: activeTab,
      ...formData as any
    });
    setIsModalOpen(false);
    setFormData({ name: '', pan: '', email: '', phone: '', address: '' });
  };

  const filteredContacts = contacts.filter(c => 
    c.type === activeTab && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.pan.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contacts</h2>
          <p className="text-slate-500">Manage your {activeTab === 'CUSTOMER' ? 'Customers' : 'Suppliers'}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-shadow"
        >
          <Plus size={18} />
          <span>Add {activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}</span>
        </button>
      </div>

      <div className="bg-slate-100 p-1 rounded-xl flex w-fit">
        <button
          onClick={() => setActiveTab('CUSTOMER')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'CUSTOMER' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={16} />
          <span>Customers</span>
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIER')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${activeTab === 'SUPPLIER' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Truck size={16} />
          <span>Suppliers</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                {contact.name.charAt(0)}
              </div>
              <button 
                onClick={() => onDeleteContact(contact.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="font-bold text-slate-900">{contact.name}</h3>
            <div className="text-xs font-semibold text-slate-500 mb-4 bg-slate-50 px-2 py-1 rounded w-fit mt-1">
              PAN: {contact.pan}
            </div>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-slate-400" />
                <span>{contact.email || 'No email'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} className="text-slate-400" />
                <span>{contact.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="text-slate-400" />
                <span>{contact.address || 'No address'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New {activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input 
                  required 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN / VAT No</label>
                <input 
                  required 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.pan}
                  onChange={e => setFormData({...formData, pan: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input 
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <input 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-semibold">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
