
import React, { useState } from 'react';
import { 
  ShoppingCart, X, Minus, Plus, ShoppingBag, 
  ArrowLeft, CreditCard, CheckCircle, Search
} from 'lucide-react';
import { WebsiteConfig, Product, CartItem, Invoice } from '../types';
import { VAT_RATE } from '../constants';

interface EcommerceProps {
  config: WebsiteConfig;
  products: Product[];
  onPlaceOrder: (invoice: Invoice) => void;
  fiscalYear: string;
  onExit: () => void;
}

const Ecommerce: React.FC<EcommerceProps> = ({ config, products, onPlaceOrder, fiscalYear, onExit }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'CHECKOUT' | 'SUCCESS'>('CART');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', address: '', phone: '' });

  // Filter sections from config
  const heroSection = config.sections.find(s => s.type === 'HERO' && s.isVisible);
  const showProducts = config.sections.find(s => s.type === 'PRODUCT_GRID' && s.isVisible);
  const showFooter = config.sections.find(s => s.type === 'FOOTER' && s.isVisible);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatAmount = cart.reduce((sum, item) => sum + (item.isTaxable ? (item.price * item.quantity * VAT_RATE) : 0), 0);
  const grandTotal = cartTotal + vatAmount;

  // Checkout Logic
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct Invoice for backend
    const invoice: Invoice = {
      id: `ORD-${Date.now()}`,
      number: `WEB-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      contactId: 'c-web-guest', // Should be real ID in prod
      customerName: customerInfo.name,
      customerPan: '', // Optional for B2C
      customerAddress: customerInfo.address,
      items: cart.map(item => ({
        id: `ITM-${Date.now()}-${item.id}`,
        productId: item.id,
        description: item.name,
        quantity: item.quantity,
        rate: item.price,
        discount: 0,
        amount: item.price * item.quantity,
        isTaxable: item.isTaxable
      })),
      subTotal: cartTotal,
      discountTotal: 0,
      taxableAmount: cart.reduce((sum, i) => i.isTaxable ? sum + (i.price * i.quantity) : sum, 0),
      nonTaxableAmount: cart.reduce((sum, i) => !i.isTaxable ? sum + (i.price * i.quantity) : sum, 0),
      vatAmount: vatAmount,
      totalAmount: grandTotal,
      paidAmount: grandTotal, // Assume instant payment for demo
      dueAmount: 0,
      payments: [{
          id: `PAY-${Date.now()}`,
          invoiceId: '',
          date: new Date().toISOString().split('T')[0],
          amount: grandTotal,
          method: 'FONEPAY',
          reference: 'Online Payment'
      }],
      status: 'PAID',
      type: 'TAX_INVOICE',
      fiscalYear: fiscalYear,
      isPrinted: false,
      source: 'ONLINE_STORE'
    };

    onPlaceOrder(invoice);
    setCheckoutStep('SUCCESS');
    setCart([]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ fontFamily: config.font }}>
      
      {/* --- Admin Bar (Demo Only) --- */}
      <div className="bg-slate-900 text-white p-2 text-center text-xs flex justify-between px-4 items-center sticky top-0 z-50">
          <span>Currently viewing your live store preview.</span>
          <button onClick={onExit} className="flex items-center space-x-1 hover:text-blue-300"><ArrowLeft size={14}/> <span>Back to Builder</span></button>
      </div>

      {/* --- Header --- */}
      <header className="sticky top-8 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: config.primaryColor }}>{config.siteName}</h1>
            <div className="flex items-center space-x-6">
                <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">
                    <a href="#" className="hover:text-black">Home</a>
                    <a href="#products" className="hover:text-black">Shop</a>
                    <a href="#" className="hover:text-black">About</a>
                </nav>
                <button className="relative p-2" onClick={() => setIsCartOpen(true)}>
                    <ShoppingBag size={24} className="text-slate-800" />
                    {cart.length > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>
         </div>
      </header>

      <main className="flex-1">
          {/* --- Hero Section --- */}
          {heroSection && (
              <section className="relative h-[500px] flex items-center justify-center bg-slate-100 overflow-hidden">
                  <img src={heroSection.image} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 text-center text-white px-4">
                      <h2 className="text-5xl font-bold mb-4">{heroSection.title}</h2>
                      <p className="text-xl opacity-90 mb-8">{heroSection.subtitle}</p>
                      <button 
                        style={{ backgroundColor: config.primaryColor }}
                        className="px-8 py-3 rounded-full font-bold text-white hover:opacity-90 transition-opacity"
                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                          Shop Now
                      </button>
                  </div>
              </section>
          )}

          {/* --- Product Grid --- */}
          {showProducts && (
              <section id="products" className="max-w-7xl mx-auto px-6 py-16">
                  <div className="flex justify-between items-end mb-10">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900">Featured Collection</h2>
                        <p className="text-slate-500 mt-2">Explore our latest arrivals.</p>
                      </div>
                      <div className="relative hidden md:block">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input placeholder="Search products..." className="pl-10 pr-4 py-2 border rounded-full text-sm w-64" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {products.filter(p => p.status === 'ACTIVE').map(product => (
                          <div key={product.id} className="group">
                              <div className="bg-slate-100 rounded-2xl overflow-hidden mb-4 relative h-64">
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  {product.stock === 0 && (
                                     <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                         <span className="bg-black text-white px-3 py-1 text-xs font-bold rounded">SOLD OUT</span>
                                     </div>
                                  )}
                              </div>
                              <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
                              <p className="text-sm text-slate-500 mb-2">{product.category}</p>
                              <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-900">Rs. {product.price.toLocaleString()}</span>
                                  <button 
                                    disabled={product.stock === 0}
                                    onClick={() => addToCart(product)}
                                    className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                      <Plus size={16} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </section>
          )}
      </main>

      {/* --- Footer --- */}
      {showFooter && (
          <footer className="bg-slate-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                      <h4 className="font-bold text-lg mb-4">{config.siteName}</h4>
                      <p className="text-slate-400 text-sm">Empowering Nepali businesses with digital commerce.</p>
                  </div>
                  <div>
                      <h5 className="font-bold mb-4">Shop</h5>
                      <ul className="space-y-2 text-sm text-slate-400">
                          <li>New Arrivals</li>
                          <li>Best Sellers</li>
                          <li>Discounted</li>
                      </ul>
                  </div>
                  <div>
                      <h5 className="font-bold mb-4">Support</h5>
                      <ul className="space-y-2 text-sm text-slate-400">
                          <li>FAQ</li>
                          <li>Shipping</li>
                          <li>Returns</li>
                      </ul>
                  </div>
                  <div>
                      <h5 className="font-bold mb-4">Stay Connected</h5>
                      <div className="flex space-x-2">
                         <input placeholder="Email Address" className="px-4 py-2 bg-slate-800 rounded-l text-sm w-full" />
                         <button className="bg-blue-600 px-4 rounded-r font-bold text-sm">Join</button>
                      </div>
                  </div>
              </div>
          </footer>
      )}

      {/* --- Cart Drawer / Checkout --- */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h2 className="text-xl font-bold text-slate-900">
                          {checkoutStep === 'CART' ? 'Your Cart' : checkoutStep === 'CHECKOUT' ? 'Secure Checkout' : 'Order Complete'}
                      </h2>
                      <button onClick={() => { setIsCartOpen(false); setCheckoutStep('CART'); }} className="p-2 hover:bg-slate-200 rounded-full">
                          <X size={20} />
                      </button>
                  </div>

                  {checkoutStep === 'CART' && (
                      <>
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                              {cart.length === 0 ? (
                                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                      <ShoppingBag size={48} className="mb-4 opacity-50"/>
                                      <p>Your cart is empty.</p>
                                  </div>
                              ) : (
                                  cart.map(item => (
                                      <div key={item.id} className="flex gap-4">
                                          <img src={item.image} className="w-20 h-20 object-cover rounded-lg bg-slate-100" />
                                          <div className="flex-1">
                                              <h4 className="font-bold text-slate-900">{item.name}</h4>
                                              <p className="text-sm text-slate-500">Rs. {item.price.toLocaleString()}</p>
                                              <div className="flex items-center space-x-3 mt-2">
                                                  <div className="flex items-center border rounded-lg">
                                                      <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 hover:bg-slate-100"><Minus size={14}/></button>
                                                      <span className="text-sm font-medium px-2">{item.quantity}</span>
                                                      <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 hover:bg-slate-100"><Plus size={14}/></button>
                                                  </div>
                                                  <button onClick={() => removeFromCart(item.id)} className="text-xs text-rose-500 font-medium">Remove</button>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                          {cart.length > 0 && (
                              <div className="p-6 border-t border-slate-100 bg-slate-50">
                                  <div className="flex justify-between mb-2 text-sm">
                                      <span>Subtotal</span>
                                      <span>Rs. {cartTotal.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between mb-4 text-sm">
                                      <span>VAT (13%)</span>
                                      <span>Rs. {vatAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between mb-6 text-xl font-bold">
                                      <span>Total</span>
                                      <span>Rs. {grandTotal.toLocaleString()}</span>
                                  </div>
                                  <button 
                                    onClick={() => setCheckoutStep('CHECKOUT')}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                                  >
                                      Proceed to Checkout
                                  </button>
                              </div>
                          )}
                      </>
                  )}

                  {checkoutStep === 'CHECKOUT' && (
                      <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col">
                          <div className="flex-1 overflow-y-auto p-6 space-y-4">
                              <h3 className="font-bold mb-2">Shipping Information</h3>
                              <input 
                                required placeholder="Full Name" 
                                className="w-full p-3 border rounded-xl"
                                value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                              />
                              <input 
                                required placeholder="Email Address" type="email"
                                className="w-full p-3 border rounded-xl"
                                value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                              />
                              <input 
                                required placeholder="Phone Number" 
                                className="w-full p-3 border rounded-xl"
                                value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                              />
                              <input 
                                required placeholder="Delivery Address" 
                                className="w-full p-3 border rounded-xl"
                                value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                              />

                              <h3 className="font-bold mt-6 mb-2">Payment Method</h3>
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="border-2 border-blue-600 bg-blue-50 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer">
                                      <CreditCard size={18} className="text-blue-600"/>
                                      <span className="font-bold text-sm text-blue-900">FonePay</span>
                                  </div>
                                  <div className="border border-slate-200 p-3 rounded-xl flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
                                      <span className="font-bold text-sm">Cash on Delivery</span>
                                  </div>
                              </div>
                          </div>
                          <div className="p-6 border-t border-slate-100 bg-slate-50">
                              <div className="flex justify-between mb-6 text-xl font-bold">
                                  <span>Total to Pay</span>
                                  <span>Rs. {grandTotal.toLocaleString()}</span>
                              </div>
                              <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                                  Confirm & Pay
                              </button>
                              <button type="button" onClick={() => setCheckoutStep('CART')} className="w-full mt-3 py-2 text-slate-500 font-bold hover:text-slate-700">
                                  Back to Cart
                              </button>
                          </div>
                      </form>
                  )}

                  {checkoutStep === 'SUCCESS' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                              <CheckCircle size={40} />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h3>
                          <p className="text-slate-500 mb-8">Thank you for shopping with {config.siteName}. Your order has been placed successfully and the invoice has been sent to your email.</p>
                          <button onClick={() => { setIsCartOpen(false); setCheckoutStep('CART'); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">
                              Continue Shopping
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default Ecommerce;
