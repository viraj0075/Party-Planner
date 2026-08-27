import React from 'react';
import { PartyPlan } from '../types';
import {
  Sparkles,
  Plus,
  Download,
  Printer,
  Copy,
  MessageSquare,
  GlassWater,
  ListOrdered,
  Layers,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { copyFormattedList, exportToCSV, printShoppingList } from '../utils/exportUtils';

interface HeaderProps {
  currentPlan: PartyPlan | null;
  allPlans: PartyPlan[];
  onSelectPlan: (id: string) => void;
  onNewParty: () => void;
  onOpenChat: () => void;
  onOpenRecipe: () => void;
  onOpenCheckout: () => void;
  isChatOpen: boolean;
  copiedToast: boolean;
  onShowCopiedToast: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlan,
  allPlans,
  onSelectPlan,
  onNewParty,
  onOpenChat,
  onOpenRecipe,
  onOpenCheckout,
  isChatOpen,
  copiedToast,
  onShowCopiedToast,
}) => {
  const totalCost = currentPlan ? currentPlan.items.reduce((acc, it) => acc + it.estimatedCost, 0) : 0;
  const budget = currentPlan ? currentPlan.details.budget : 0;
  const checkedCount = currentPlan ? currentPlan.items.filter((it) => it.checked).length : 0;
  const totalCount = currentPlan ? currentPlan.items.length : 0;
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0;
  const isOverBudget = totalCost > budget;

  const handleCopy = async () => {
    if (!currentPlan) return;
    const ok = await copyFormattedList(currentPlan);
    if (ok) onShowCopiedToast();
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Plan Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                  CymbalMart
                </span>
                <span className="text-xs font-semibold text-zinc-600 hidden sm:inline">
                  Shopping Agent
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  AI CUJ Assistant
                </span>
              </div>

              {allPlans.length > 0 && currentPlan ? (
                <div className="relative flex items-center">
                  <select
                    id="party-plan-selector"
                    value={currentPlan.details.id}
                    onChange={(e) => onSelectPlan(e.target.value)}
                    className="font-bold text-zinc-900 text-sm sm:text-base bg-transparent border-none p-0 pr-6 truncate cursor-pointer focus:ring-0 focus:outline-none hover:text-amber-700 transition-colors"
                  >
                    {allPlans.map((p) => (
                      <option key={p.details.id} value={p.details.id}>
                        {p.details.title} ({p.details.guestCount} guests)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <h1 className="text-sm sm:text-base font-bold text-zinc-900 truncate">
                  No Active Plan
                </h1>
              )}
            </div>
          </div>

          {/* Quick Metrics (Desktop) */}
          {currentPlan && (
            <div className="hidden md:flex items-center gap-6 text-xs text-zinc-600">
              {/* Items completion */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">
                    {checkedCount} / {totalCount} Items
                  </div>
                  <div className="text-zinc-500 text-[11px]">
                    {totalCount > 0 ? `${Math.round((checkedCount / totalCount) * 100)}% Purchased` : '0%'}
                  </div>
                </div>
              </div>

              {/* Budget Health */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isOverBudget
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  <span className="font-bold text-xs">$</span>
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">
                    ${totalCost.toFixed(0)}{' '}
                    <span className="text-zinc-400 font-normal">/ ${budget}</span>
                  </div>
                  <div
                    className={`text-[11px] font-medium ${
                      isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isOverBudget
                      ? `$${(totalCost - budget).toFixed(0)} over cap`
                      : `$${(budget - totalCost).toFixed(0)} remaining`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Signature recipe button */}
            {currentPlan?.signatureRecipe && (
              <button
                id="header-signature-recipe-btn"
                onClick={onOpenRecipe}
                title="View Signature Party Drink Recipe"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <GlassWater className="w-4 h-4 text-amber-600" />
                <span>Signature Drink</span>
              </button>
            )}

            {/* Export Menu dropdown / buttons */}
            {currentPlan && (
              <div className="flex items-center gap-1">
                <button
                  id="header-copy-btn"
                  onClick={handleCopy}
                  title="Copy formatted markdown list"
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  id="header-csv-btn"
                  onClick={() => exportToCSV(currentPlan)}
                  title="Download CSV spreadsheet"
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  id="header-print-btn"
                  onClick={() => printShoppingList(currentPlan)}
                  title="Print shopping list"
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CymbalMart Assistant Chatbot Toggle */}
            <button
              id="header-ai-copilot-btn"
              onClick={onOpenChat}
              title="Chat with CymbalMart Assistant"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                isChatOpen
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent hover:from-amber-600 hover:to-orange-600 shadow-xs'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CymbalMart Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse hidden sm:inline-block" />
            </button>

            {/* Finalize & Checkout CUJ Step 3 button */}
            {currentPlan && (
              <button
                id="header-checkout-btn"
                onClick={onOpenCheckout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize & Checkout</span>
              </button>
            )}

            {/* New Party Planner Button */}
            <button
              id="header-new-party-btn"
              onClick={onNewParty}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Party</span>
            </button>
          </div>
        </div>

        {/* Toast alert for copied */}
        {copiedToast && (
          <div className="absolute top-20 right-8 z-50 bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Shopping list copied to clipboard!</span>
          </div>
        )}
      </div>
    </header>
  );
};
