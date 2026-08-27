import React, { useState } from 'react';
import { PartyPlan } from '../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  Truck,
  Store,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Printer,
  Copy,
  Users,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { copyFormattedList, exportToCSV, printShoppingList } from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onMarkAllPurchased: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  onMarkAllPurchased,
}) => {
  const [fulfillmentType, setFulfillmentType] = useState<'curbside' | 'delivery' | 'instore'>('curbside');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('Friday, 3:00 PM - 4:00 PM (1 Day Before Event)');

  if (!isOpen) return null;

  const { details, items } = plan;
  const totalCost = items.reduce((acc, it) => acc + it.estimatedCost, 0);
  const budget = details.budget;
  const isOver = totalCost > budget;
  const memberSavings = Math.round(totalCost * 0.08); // 8% CymbalMart Rewards savings
  const finalTotal = Math.max(0, totalCost - memberSavings);
  const checkedItems = items.filter((i) => i.checked);

  const handlePlaceOrder = () => {
    const generatedId = `CM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setOrderDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    setIsOrdered(true);
    onMarkAllPurchased();

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });
  };

  const handleReset = () => {
    setIsOrdered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  CymbalMart Party Checkout
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                  CUJ Step 3: Refine & Finalize
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                {isOrdered ? 'Party Shopping Order Confirmed!' : 'Review & Finalize Party Shopping Plan'}
              </h2>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isOrdered ? (
            <>
              {/* Event Quick Recap */}
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Event & Theme</span>
                  <span className="font-bold text-zinc-900 truncate block">{details.title}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Guest Count</span>
                  <span className="font-bold text-zinc-900">{details.guestCount} Guests ({details.adultCount} adults)</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Target Budget</span>
                  <span className="font-bold text-zinc-900">${details.budget}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Total Curated Items</span>
                  <span className="font-bold text-zinc-900">{items.length} Items</span>
                </div>
              </div>

              {/* Fulfillment Method Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Choose CymbalMart Fulfillment Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('curbside')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      fulfillmentType === 'curbside'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Store className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        FREE
                      </span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900">Curbside Pickup</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Packed & loaded into your car at CymbalMart Drive-Up
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      fulfillmentType === 'delivery'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold text-zinc-700 bg-zinc-200 px-1.5 py-0.5 rounded">
                        Express
                      </span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900">Doorstep Delivery</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Direct scheduled delivery to your party venue
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('instore')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      fulfillmentType === 'instore'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Receipt className="w-4 h-4 text-purple-600" />
                      <span className="text-[10px] font-bold text-zinc-700 bg-zinc-200 px-1.5 py-0.5 rounded">
                        Self-Shop
                      </span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900">In-Store Checklist</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Organized aisle-by-aisle for fast in-person run
                    </div>
                  </button>
                </div>
              </div>

              {/* Time slot selector */}
              {fulfillmentType !== 'instore' && (
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Preferred Timing Slot</span>
                    </span>
                    <span className="text-amber-800 text-[11px]">Recommended: Day prior for pre-chilling</span>
                  </div>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Friday, 3:00 PM - 4:00 PM (1 Day Before Event)">
                      1 Day Before Event (3:00 PM - 4:00 PM) - Recommended for Prepping
                    </option>
                    <option value="Morning of Event (9:00 AM - 10:00 AM)">
                      Morning of Event (9:00 AM - 10:00 AM) - Best for Fresh Ice & Bakery
                    </option>
                    <option value="2 Days Before Event (5:00 PM - 6:00 PM)">
                      2 Days Before Event (5:00 PM - 6:00 PM) - Dry Goods & Drinks Run
                    </option>
                  </select>
                </div>
              )}

              {/* Items Preview Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700 uppercase tracking-wider">
                    Curated Items Breakdown ({items.length} items)
                  </span>
                  <span className="text-zinc-500">
                    {checkedItems.length} checked / {items.length} total
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 divide-y divide-zinc-100 text-xs">
                  {items.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between hover:bg-zinc-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-400">
                          {item.checked ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded border border-zinc-300" />}
                        </span>
                        <span className="font-semibold text-zinc-800 truncate">{item.name}</span>
                        <span className="text-zinc-400 text-[11px]">({item.quantity} {item.unit})</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {item.store}
                        </span>
                        <span className="font-bold text-zinc-900">${item.estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Savings Calculation Summary */}
              <div className="bg-zinc-900 text-white rounded-xl p-4 space-y-3">
                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Subtotal Estimated Cart:</span>
                    <span className="font-medium text-white">${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>CymbalMart Party Bundle & Member Discount:</span>
                    </span>
                    <span className="font-bold">-${memberSavings.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Fulfillment & Packing:</span>
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">Final Estimated Total</span>
                    <span className="text-2xl font-black text-amber-400">${finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Budget Comparison</span>
                    <span className={`text-xs font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isOver ? `$${(totalCost - budget).toFixed(2)} over cap` : `$${(budget - finalTotal).toFixed(2)} under cap`}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <FileCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  CymbalMart Event Planning Ready
                </span>
                <h3 className="text-2xl font-black text-zinc-900">
                  You're Ready to Host! 🎉
                </h3>
                <p className="text-sm text-zinc-600 max-w-md mx-auto">
                  Your curated party shopping plan <strong>#{orderId}</strong> is finalized with all quantities calibrated for {details.guestCount} guests.
                </p>
              </div>

              {/* Order Specs card */}
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 max-w-lg mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">Order Reference:</span>
                  <span className="font-bold font-mono text-zinc-900">{orderId}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">Event Title:</span>
                  <span className="font-bold text-zinc-900">{details.title}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">Fulfillment Method:</span>
                  <span className="font-bold text-zinc-900 capitalize">
                    {fulfillmentType === 'curbside' ? 'CymbalMart Curbside Pickup' : fulfillmentType === 'delivery' ? 'Express Doorstep Delivery' : 'In-Store Shopping Checklist'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500">Slot / Timing:</span>
                  <span className="font-bold text-zinc-900">{pickupSlot}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-zinc-500 font-semibold">Total Estimated Amount:</span>
                  <span className="font-black text-emerald-700 text-sm">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Quick Actions after finalizing */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => printShoppingList(plan)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-xs"
                >
                  <Printer className="w-4 h-4 text-zinc-500" />
                  <span>Print Packing Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportToCSV(plan)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-xs"
                >
                  <Download className="w-4 h-4 text-zinc-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyFormattedList(plan)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-xs"
                >
                  <Copy className="w-4 h-4 text-zinc-500" />
                  <span>Copy List to Clipboard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CymbalMart 100% Party Freshness Guarantee</span>
          </div>

          <div className="flex items-center gap-3">
            {!isOrdered ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg transition-colors"
                >
                  Back to List
                </button>
                <button
                  type="button"
                  id="confirm-finalize-order-btn"
                  onClick={handlePlaceOrder}
                  className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm transition-all"
                >
                  <span>Finalize & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                id="done-checkout-btn"
                onClick={handleReset}
                className="px-6 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
