import React, { useState, useMemo } from 'react';
import { ShoppingItem, ItemCategory, StoreType, ItemPriority } from '../types';
import { ItemRow } from './ItemRow';
import {
  Search,
  Plus,
  Filter,
  CheckCheck,
  RotateCcw,
  Store,
  Layers,
  ArrowUpDown,
  Sparkles,
  ShoppingBag,
  ListFilter,
} from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleCheck: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onDeleteItem: (id: string) => void;
  onApplyAlternative: (id: string) => void;
  onOpenAddItem: () => void;
  onBulkCheck: (checked: boolean) => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleCheck,
  onEditItem,
  onDeleteItem,
  onApplyAlternative,
  onOpenAddItem,
  onBulkCheck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all');
  const [groupBy, setGroupBy] = useState<'category' | 'store' | 'none'>('category');
  const [sortBy, setSortBy] = useState<'default' | 'price_desc' | 'price_asc' | 'priority'>('default');

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesStore = item.store.toLowerCase().includes(q);
        if (!matchesName && !matchesNotes && !matchesStore) return false;
      }

      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Store match
      if (selectedStore !== 'all' && item.store !== selectedStore) {
        return false;
      }

      // Priority match
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      // Status match
      if (statusFilter === 'pending' && item.checked) return false;
      if (statusFilter === 'purchased' && !item.checked) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedStore, selectedPriority, statusFilter]);

  // Sorted items
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => b.estimatedCost - a.estimatedCost);
    }
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => a.estimatedCost - b.estimatedCost);
    }
    if (sortBy === 'priority') {
      const rank = { 'must-have': 1, 'nice-to-have': 2, backup: 3 };
      return list.sort((a, b) => (rank[a.priority] || 4) - (rank[b.priority] || 4));
    }
    return list;
  }, [filteredItems, sortBy]);

  // Unique stores for filter
  const uniqueStores = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.store)));
  }, [items]);

  // Categories list
  const categories: { id: ItemCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'All Categories', emoji: '✨' },
    { id: 'food', label: 'Food & Fresh', emoji: '🌮' },
    { id: 'drinks', label: 'Drinks, Alcohol & Ice', emoji: '🍷' },
    { id: 'decor', label: 'Decor & Ambiance', emoji: '🎨' },
    { id: 'entertainment', label: 'Games & Favors', emoji: '🎲' },
    { id: 'supplies', label: 'Tableware & Supplies', emoji: '🍴' },
  ];

  // Grouping structures
  const groupedData = useMemo(() => {
    if (groupBy === 'none') {
      return [{ groupName: 'All Items', items: sortedItems }];
    }

    if (groupBy === 'category') {
      const order: ItemCategory[] = ['food', 'drinks', 'decor', 'entertainment', 'supplies'];
      return order
        .map((cat) => {
          const groupItems = sortedItems.filter((i) => i.category === cat);
          const catLabels: Record<ItemCategory, string> = {
            food: '🌮 Food & Fresh Ingredients',
            drinks: '🍷 Beverages, Mixers, Alcohol & Ice',
            decor: '🎨 Decor, Lighting & Ambiance',
            entertainment: '🎲 Games, Favors & Entertainment',
            supplies: '🍴 Tableware, Prep Equipment & Supplies',
          };
          return {
            groupName: catLabels[cat],
            items: groupItems,
            totalCost: groupItems.reduce((a, b) => a + b.estimatedCost, 0),
          };
        })
        .filter((g) => g.items.length > 0);
    }

    if (groupBy === 'store') {
      const stores = Array.from(new Set(sortedItems.map((i) => i.store)));
      return stores.map((st) => {
        const groupItems = sortedItems.filter((i) => i.store === st);
        return {
          groupName: `🏪 ${st}`,
          items: groupItems,
          totalCost: groupItems.reduce((a, b) => a + b.estimatedCost, 0),
        };
      });
    }

    return [];
  }, [sortedItems, groupBy]);

  const totalFilteredCost = filteredItems.reduce((acc, it) => acc + it.estimatedCost, 0);
  const checkedFilteredCost = filteredItems.filter((it) => it.checked).reduce((acc, it) => acc + it.estimatedCost, 0);

  return (
    <div className="space-y-5">
      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all' ? items.length : items.filter((i) => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  isSelected ? 'bg-amber-600 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Control Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              id="shopping-list-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, stores, ingredients..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Item & Bulk Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="add-custom-item-btn"
              onClick={onOpenAddItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg">
            <button
              id="status-filter-all"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              id="status-filter-pending"
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              To Buy ({items.filter((i) => !i.checked).length})
            </button>
            <button
              id="status-filter-purchased"
              onClick={() => setStatusFilter('purchased')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'purchased'
                  ? 'bg-white text-zinc-900 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Bought ({items.filter((i) => i.checked).length})
            </button>
          </div>

          {/* Store & Priority & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Store filter */}
            <select
              id="store-filter-select"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md text-zinc-700 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Stores</option>
              {uniqueStores.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              id="priority-filter-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md text-zinc-700 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Priorities</option>
              <option value="must-have">Must-Have Only</option>
              <option value="nice-to-have">Nice-to-Have</option>
              <option value="backup">Backup</option>
            </select>

            {/* Group By */}
            <select
              id="group-by-select"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md text-zinc-700 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="category">Group: Category</option>
              <option value="store">Group: Store</option>
              <option value="none">Flat List</option>
            </select>

            {/* Sort By */}
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md text-zinc-700 text-xs focus:ring-1 focus:ring-amber-500"
            >
              <option value="default">Sort: Default</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="priority">Priority Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Summary stats */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <div>
          Showing <strong>{filteredItems.length}</strong> items • Estimated Total:{' '}
          <strong className="text-zinc-900">${totalFilteredCost.toFixed(2)}</strong>
          {checkedFilteredCost > 0 && (
            <span className="ml-1 text-emerald-600 font-semibold">
              (${checkedFilteredCost.toFixed(2)} bought)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            id="check-all-filtered-btn"
            onClick={() => onBulkCheck(true)}
            className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
          >
            Mark All Bought
          </button>
          <span className="text-zinc-300">|</span>
          <button
            id="uncheck-all-filtered-btn"
            onClick={() => onBulkCheck(false)}
            className="text-zinc-600 hover:text-zinc-900 hover:underline"
          >
            Reset All to Buy
          </button>
        </div>
      </div>

      {/* Items Groups */}
      {groupedData.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-zinc-300">
          <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-zinc-800">No items match your filters</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or clearing category/store filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStore('all');
              setSelectedPriority('all');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedData.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-800 tracking-tight">
                  {group.groupName}
                </h3>
                {group.totalCost !== undefined && (
                  <span className="text-xs font-semibold text-zinc-500">
                    ${group.totalCost.toFixed(2)} ({group.items.length} items)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {group.items.map((item) => (
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
          ))}
        </div>
      )}
    </div>
  );
};
