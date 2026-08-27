import React, { useState, useEffect } from 'react';
import { ShoppingItem, ItemCategory, StoreType, ItemPriority } from '../types';
import { X, Save, Edit3 } from 'lucide-react';

interface EditItemModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ShoppingItem) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('food');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('pack');
  const [estimatedCost, setEstimatedCost] = useState<number>(10);
  const [store, setStore] = useState<StoreType>('Supermarket / Grocery');
  const [priority, setPriority] = useState<ItemPriority>('must-have');
  const [notes, setNotes] = useState('');
  const [portionBasis, setPortionBasis] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity);
      setUnit(item.unit);
      setEstimatedCost(item.estimatedCost);
      setStore(item.store);
      setPriority(item.priority);
      setNotes(item.notes || '');
      setPortionBasis(item.portionBasis || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...item,
      name: name.trim(),
      category,
      quantity,
      unit,
      estimatedCost,
      store,
      priority,
      notes: notes.trim() || undefined,
      portionBasis: portionBasis.trim() || undefined,
    });
    onClose();
  };

  const storeOptions: StoreType[] = [
    'Costco / Wholesale',
    "Trader Joe's",
    'Supermarket / Grocery',
    'Target / Retail',
    'Party City / Amazon',
    'Liquor Store',
    'Local Bakery / Deli',
    'General / Other',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Edit Shopping Item</h3>
          </div>
          <button
            id="close-edit-item-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Item Name</label>
            <input
              id="edit-item-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
              <select
                id="edit-item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
              >
                <option value="food">Food & Ingredients</option>
                <option value="drinks">Beverages, Alcohol & Ice</option>
                <option value="decor">Decor & Ambiance</option>
                <option value="entertainment">Entertainment & Favors</option>
                <option value="supplies">Tableware & Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Store Type</label>
              <select
                id="edit-item-store-select"
                value={store}
                onChange={(e) => setStore(e.target.value as StoreType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {storeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Quantity</label>
              <input
                id="edit-item-quantity-input"
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Unit</label>
              <input
                id="edit-item-unit-input"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Est. Cost ($)</label>
              <input
                id="edit-item-cost-input"
                type="number"
                min="0"
                step="0.01"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Priority</label>
              <select
                id="edit-item-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ItemPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="must-have">Must-Have (Essential)</option>
                <option value="nice-to-have">Nice-to-Have (Optional)</option>
                <option value="backup">Backup / Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Portion Basis (Optional)</label>
              <input
                id="edit-item-portion-basis-input"
                type="text"
                value={portionBasis}
                onChange={(e) => setPortionBasis(e.target.value)}
                placeholder="e.g. 2 per guest"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Notes / Brand Preferences</label>
            <input
              id="edit-item-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200">
            <button
              type="button"
              id="cancel-edit-item-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-edit-item-btn"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
