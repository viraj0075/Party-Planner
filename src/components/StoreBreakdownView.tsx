import React, { useState } from 'react';
import { ShoppingItem, StoreType } from '../types';
import {
  Store,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Navigation,
  Sparkles,
  ShoppingBag,
  TrendingDown,
} from 'lucide-react';
import { ItemRow } from './ItemRow';

interface StoreBreakdownViewProps {
  items: ShoppingItem[];
  onToggleCheck: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onDeleteItem: (id: string) => void;
  onApplyAlternative: (id: string) => void;
}

export const StoreBreakdownView: React.FC<StoreBreakdownViewProps> = ({
  items,
  onToggleCheck,
  onEditItem,
  onDeleteItem,
  onApplyAlternative,
}) => {
  const [copiedStore, setCopiedStore] = useState<string | null>(null);

  // Group items by store
  const storeMap: Record<string, ShoppingItem[]> = {};
  items.forEach((it) => {
    if (!storeMap[it.store]) storeMap[it.store] = [];
    storeMap[it.store].push(it);
  });

  const stores = Object.keys(storeMap).sort(
    (a, b) => storeMap[b].length - storeMap[a].length
  );

  const getStoreEmoji = (storeName: string) => {
    const s = storeName.toLowerCase();
    if (s.includes('cymbalmart') || s.includes('cymbal')) return '🟡';
    if (s.includes('costco') || s.includes('wholesale') || s.includes("sam's")) return '📦';
    if (s.includes('trader joe')) return '🌺';
    if (s.includes('target') || s.includes('walmart')) return '🎯';
    if (s.includes('party city') || s.includes('amazon')) return '🎈';
    if (s.includes('liquor')) return '🍾';
    if (s.includes('bakery')) return '🥖';
    return '🛒';
  };

  const getStoreTip = (storeName: string) => {
    const s = storeName.toLowerCase();
    if (s.includes('cymbalmart'))
      return 'CymbalMart One-Stop Party Hub: Fresh deli, bakery platters, beverage depot & party supplies under one roof.';
    if (s.includes('costco') || s.includes('wholesale'))
      return 'Great for bulk sodas, chips, beer cases, slider meats, and large dip tubs.';
    if (s.includes('trader joe'))
      return 'Best for artisan cheeses, dips, unique finger food appetizers, and $6-$10 wine bottles.';
    if (s.includes('target') || s.includes('retail'))
      return 'Ideal for color-matched party plates, napkins, disposable cups, and party games.';
    if (s.includes('party city') || s.includes('amazon'))
      return 'Order custom balloon arches, photo backdrops, and theme-specific centerpieces.';
    if (s.includes('liquor'))
      return 'Pick up specialty spirits, cocktail garnishes, craft bitters, and extra ice bags.';
    if (s.includes('bakery'))
      return 'Order custom birthday cake or fresh artisan sourdough baguettes.';
    return 'Standard grocery trip for fresh produce, herbs, and dairy essentials.';
  };

  const handleCopyStoreList = (storeName: string, storeItems: ShoppingItem[]) => {
    let text = `🛒 ${storeName} Shopping Trip List\n`;
    text += `Total Estimated: $${storeItems.reduce((a, b) => a + b.estimatedCost, 0).toFixed(2)}\n\n`;
    storeItems.forEach((it) => {
      text += `${it.checked ? '[x]' : '[ ]'} ${it.name} - ${it.quantity} ${it.unit} (~$${it.estimatedCost.toFixed(2)})\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopiedStore(storeName);
      setTimeout(() => setCopiedStore(null), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Route Efficiency Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              CymbalMart Trip & Aisle Optimizer
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Aisle-by-Aisle Shopping Route
          </h2>
          <p className="text-xs text-zinc-300 max-w-xl mt-1">
            Items are categorized into store departments and aisles to save busy hosts valuable shopping time and minimize backtracking.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-800/80 px-4 py-2.5 rounded-xl border border-zinc-700 shrink-0">
          <div>
            <span className="text-[11px] text-zinc-400 block">Total Stops</span>
            <span className="text-xl font-bold text-amber-400">{stores.length} Stores</span>
          </div>
          <div className="h-8 w-px bg-zinc-700" />
          <div>
            <span className="text-[11px] text-zinc-400 block">Total Items</span>
            <span className="text-xl font-bold text-white">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 gap-6">
        {stores.map((storeName) => {
          const storeItems = storeMap[storeName];
          const totalCost = storeItems.reduce((acc, it) => acc + it.estimatedCost, 0);
          const checkedItems = storeItems.filter((i) => i.checked);
          const isComplete = checkedItems.length === storeItems.length && storeItems.length > 0;

          return (
            <div
              key={storeName}
              id={`store-card-${storeName.replace(/[^a-z0-9]/gi, '_')}`}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isComplete ? 'border-emerald-200 bg-emerald-50/10' : 'border-zinc-200 shadow-xs'
              }`}
            >
              {/* Store Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-2xl shrink-0">
                    {getStoreEmoji(storeName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-zinc-900">{storeName}</h3>
                      {isComplete && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{getStoreTip(storeName)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-900">${totalCost.toFixed(2)}</div>
                    <div className="text-[11px] text-zinc-500">
                      {checkedItems.length} of {storeItems.length} bought
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyStoreList(storeName, storeItems)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedStore === storeName ? 'Copied!' : 'Copy Trip'}</span>
                  </button>
                </div>
              </div>

              {/* Store Items List */}
              <div className="p-4 sm:p-5 grid grid-cols-1 gap-2.5">
                {storeItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={onToggleCheck}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    onApplyAlternative={onApplyAlternative}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
