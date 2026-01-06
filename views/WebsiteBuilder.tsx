
import React, { useState } from 'react';
import { 
  ShoppingBag, Layout, Palette, Plus, Trash2, Edit2, 
  ExternalLink, ArrowUp, ArrowDown, Save, Image as ImageIcon
} from 'lucide-react';
import { Product, WebsiteConfig } from '../types';

interface WebsiteBuilderProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  config: WebsiteConfig;
  onUpdateConfig: (config: WebsiteConfig) => void;
  onPreviewStore: () => void;
}

const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ 
  products, onUpdateProducts, config, onUpdateConfig, onPreviewStore 
}) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'THEME' | 'PAGES'>('PRODUCTS');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Product Form State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', sku: '', category: '', price: 0, stock: 0, description: '', image: '', isTaxable: true, status: 'ACTIVE'
  });

  // --- Product Handlers ---
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (productForm.id) {
       // Edit
       onUpdateProducts(products.map(p => p.id === productForm.id ? { ...p, ...productForm } as Product : p));
    } else {
       // Add
       onUpdateProducts([...products, { ...productForm, id: `PROD-${Date.now()}` } as Product]);
    }
    setIsProductModalOpen(false);
    setProductForm({ name: '', sku: '', category: '', price: 0, stock: 0, description: '', image: '', isTaxable: true, status: 'ACTIVE' });
  };

  const handleEditProduct = (p: Product) => {
    setProductForm(p);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if(confirm('Delete this product?')) {
        onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  // --- Theme Handlers ---
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...config.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    onUpdateConfig({ ...config, sections: newSections });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Website & Store Builder</h2>
          <p className="text-slate-500">Manage products, customize your site, and track inventory.</p>
        </div>
        <button 
          onClick={onPreviewStore}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md"
        >
          <ExternalLink size={18} />
          <span>View Live Store</span>
        </button>
      </div>

      <div className="bg-white p-1 rounded-xl border border-slate-200 flex w-fit">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'PRODUCTS' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab('THEME')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'THEME' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Palette size={18} />
          <span>Theme & Style</span>
        </button>
        <button
          onClick={() => setActiveTab('PAGES')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'PAGES' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Layout size={18} />
          <span>Page Builder</span>
        </button>
      </div>

      {/* --- PRODUCTS TAB --- */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
           <div className="flex justify-end">
              <button onClick={() => { setProductForm({}); setIsProductModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center space-x-2">
                 <Plus size={16} /> <span>Add Product</span>
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                 <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="h-48 bg-slate-100 relative">
                        {product.image ? (
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon size={48} />
                           </div>
                        )}
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditProduct(product)} className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><Edit2 size={14}/></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white rounded-full text-rose-600 shadow-sm"><Trash2 size={14}/></button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                             <div>
                                <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                                <p className="text-xs text-slate-500">{product.sku}</p>
                             </div>
                             <span className="font-bold text-slate-900">Rs.{product.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-100">
                             <span className={`${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'} font-medium`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                             </span>
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{product.category}</span>
                        </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* --- THEME TAB --- */}
      {activeTab === 'THEME' && (
         <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-2xl">
            <h3 className="font-bold text-lg mb-6">Store Branding</h3>
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Store Name</label>
                  <input 
                     className="w-full p-3 border border-slate-200 rounded-xl"
                     value={config.siteName}
                     onChange={e => onUpdateConfig({...config, siteName: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Primary Color</label>
                      <div className="flex items-center space-x-3">
                          <input 
                             type="color" 
                             className="h-10 w-10 rounded cursor-pointer border-0"
                             value={config.primaryColor}
                             onChange={e => onUpdateConfig({...config, primaryColor: e.target.value})}
                          />
                          <span className="text-sm font-mono text-slate-500">{config.primaryColor}</span>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Font Family</label>
                      <select 
                         className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                         value={config.font}
                         onChange={e => onUpdateConfig({...config, font: e.target.value})}
                      >
                         <option value="Inter">Inter (Modern)</option>
                         <option value="Roboto">Roboto (Standard)</option>
                         <option value="Serif">Serif (Elegant)</option>
                      </select>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- PAGE BUILDER TAB --- */}
      {activeTab === 'PAGES' && (
         <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-3xl">
             <h3 className="font-bold text-lg mb-6">Homepage Layout</h3>
             <div className="space-y-3">
                 {config.sections.map((section, index) => (
                    <div key={section.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center space-x-4">
                           <div className="p-2 bg-white rounded-lg border border-slate-200">
                               <Layout size={20} className="text-slate-400" />
                           </div>
                           <div>
                               <p className="font-bold text-slate-700">{section.type.replace('_', ' ')}</p>
                               <p className="text-xs text-slate-500">{section.title || 'Default Section'}</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             <input 
                                type="checkbox" 
                                checked={section.isVisible}
                                onChange={e => {
                                    const newSecs = [...config.sections];
                                    newSecs[index].isVisible = e.target.checked;
                                    onUpdateConfig({...config, sections: newSecs});
                                }}
                                className="mr-4 w-4 h-4 text-blue-600 rounded"
                             />
                             <button onClick={() => handleMoveSection(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowUp size={18} /></button>
                             <button onClick={() => handleMoveSection(index, 'down')} disabled={index === config.sections.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ArrowDown size={18} /></button>
                             
                             {/* Simplified editor for Hero Section */}
                             {section.type === 'HERO' && (
                                <div className="ml-4 border-l pl-4 border-slate-300">
                                   <input 
                                     placeholder="Hero Title"
                                     className="text-xs p-1 border rounded mb-1 block w-40"
                                     value={section.title}
                                     onChange={e => {
                                         const newSecs = [...config.sections];
                                         newSecs[index].title = e.target.value;
                                         onUpdateConfig({...config, sections: newSecs});
                                     }}
                                   />
                                   <input 
                                     placeholder="Image URL"
                                     className="text-xs p-1 border rounded block w-40"
                                     value={section.image}
                                     onChange={e => {
                                         const newSecs = [...config.sections];
                                         newSecs[index].image = e.target.value;
                                         onUpdateConfig({...config, sections: newSecs});
                                     }}
                                   />
                                </div>
                             )}
                        </div>
                    </div>
                 ))}
             </div>
         </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                 <h3 className="text-xl font-bold mb-4">{productForm.id ? 'Edit Product' : 'Add New Product'}</h3>
                 <form onSubmit={handleSaveProduct} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                            <input required className="w-full p-2 border rounded-lg" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU</label>
                            <input required className="w-full p-2 border rounded-lg" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} />
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (Rs)</label>
                            <input type="number" required className="w-full p-2 border rounded-lg" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock</label>
                            <input type="number" required className="w-full p-2 border rounded-lg" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                            <input required className="w-full p-2 border rounded-lg" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                        <input className="w-full p-2 border rounded-lg" placeholder="https://..." value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                        <textarea className="w-full p-2 border rounded-lg" rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                     </div>
                     <div className="flex items-center space-x-2">
                         <input type="checkbox" className="w-4 h-4" checked={productForm.isTaxable} onChange={e => setProductForm({...productForm, isTaxable: e.target.checked})} />
                         <span className="text-sm text-slate-700">Taxable Product (13% VAT)</span>
                     </div>
                     <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-4">
                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold">Save Product</button>
                     </div>
                 </form>
             </div>
         </div>
      )}
    </div>
  );
};

export default WebsiteBuilder;
