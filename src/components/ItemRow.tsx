import React from 'react';
import { ShoppingItem, ItemCategory, StoreType } from '../types';
import {
  Check,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRightLeft,
  Info,
  Store,
  Utensils,
  Wine,
  Palette,
  Gamepad2,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemRowProps {
  item: ShoppingItem;
  onToggleCheck: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onApplyAlternative: (id: string) => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onToggleCheck,
  onEdit,
  onDelete,
  onApplyAlternative,
}) => {
  const getCategoryIcon = (cat: ItemCategory) => {
    switch (cat) {
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-orange-500" />;
      case 'drinks':
        return <Wine className="w-3.5 h-3.5 text-purple-500" />;
      case 'decor':
        return <Palette className="w-3.5 h-3.5 text-pink-500" />;
      case 'entertainment':
        return <Gamepad2 className="w-3.5 h-3.5 text-indigo-500" />;
      case 'supplies':
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Package className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'must-have':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Must-Have
          </span>
        );
      case 'nice-to-have':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Nice-to-Have
          </span>
        );
      case 'backup':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
            Backup
          </span>
        );
      default:
        return null;
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.checked) {
      // Fire confetti burst
      confetti({
        particleCount: 25,
        spread: 40,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      });
    }
    onToggleCheck(item.id);
  };

  return (
    <div
      id={`item-row-${item.id}`}
      className={`group relative rounded-xl p-3.5 sm:p-4 border transition-all ${
        item.checked
          ? 'bg-zinc-50/80 border-zinc-200 opacity-75'
          : 'bg-white border-zinc-200 hover:border-amber-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Checkbox & Main Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Custom Checkbox */}
          <button
            type="button"
            id={`checkbox-${item.id}`}
            onClick={handleCheckboxClick}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              item.checked
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-zinc-300 bg-white hover:border-emerald-500'
            }`}
          >
            {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span
                className={`font-semibold text-xs sm:text-sm ${
                  item.checked ? 'line-through text-zinc-400' : 'text-zinc-900'
                }`}
              >
                {item.name}
              </span>

              {getPriorityBadge(item.priority)}

              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-zinc-100 text-zinc-700">
                {getCategoryIcon(item.category)}
                <span className="capitalize">{item.category}</span>
              </span>
            </div>

            {/* Sub-details (quantity, store, portion math) */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">
                Qty: {item.quantity} {item.unit}
              </span>

              <span className="inline-flex items-center gap-1 text-zinc-600">
                <Store className="w-3 h-3 text-zinc-400" />
                <span>{item.store}</span>
              </span>

              {item.portionBasis && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60"
                  title={item.portionBasis}
                >
                  <Info className="w-3 h-3" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{item.portionBasis}</span>
                </span>
              )}
            </div>

            {/* Notes if any */}
            {item.notes && (
              <p className="text-xs text-zinc-500 mt-1.5 italic bg-zinc-50/80 p-1.5 rounded border border-zinc-100">
                {item.notes}
              </p>
            )}

            {/* Alternative Swap Callout */}
            {item.suggestedAlternative && !item.checked && (
              <div className="mt-2.5 flex items-center justify-between gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 truncate">
                    <strong>Swap to {item.suggestedAlternative.name}:</strong>{' '}
                    {item.suggestedAlternative.reason}
                  </span>
                </div>
                <button
                  type="button"
                  id={`swap-btn-${item.id}`}
                  onClick={() => onApplyAlternative(item.id)}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>
                    Save ${Math.abs(item.suggestedAlternative.costDiff).toFixed(0)}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Price & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div
              className={`text-sm sm:text-base font-bold ${
                item.checked ? 'text-zinc-400 line-through' : 'text-zinc-900'
              }`}
            >
              ${item.estimatedCost.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-400">
              ~${(item.estimatedCost / Math.max(1, item.quantity)).toFixed(2)} / {item.unit}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              id={`edit-item-btn-${item.id}`}
              onClick={() => onEdit(item)}
              title="Edit item"
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id={`delete-item-btn-${item.id}`}
              onClick={() => onDelete(item.id)}
              title="Delete item"
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
