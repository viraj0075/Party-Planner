import React, { useState } from 'react';
import { PartyPlan, ShoppingItem, SavingsTip, SplurgeTip } from '../types';
import {
  DollarSign,
  TrendingDown,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  PieChart,
  ShoppingBag,
  Sliders,
  Award,
} from 'lucide-react';

interface BudgetOptimizerViewProps {
  plan: PartyPlan;
  onApplyAlternative: (itemId: string) => void;
  onUpdateBudget: (newBudget: number) => void;
}

export const BudgetOptimizerView: React.FC<BudgetOptimizerViewProps> = ({
  plan,
  onApplyAlternative,
  onUpdateBudget,
}) => {
  const { details, items, budgetOptimization } = plan;
  const [targetBudgetInput, setTargetBudgetInput] = useState<number>(details.budget);
  const [appliedTips, setAppliedTips] = useState<string[]>([]);

  const totalCost = items.reduce((acc, it) => acc + it.estimatedCost, 0);
  const isOver = totalCost > details.budget;
  const diff = Math.abs(totalCost - details.budget);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  items.forEach((it) => {
    categoryTotals[it.category] = (categoryTotals[it.category] || 0) + it.estimatedCost;
  });

  const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
    food: { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
    drinks: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
    decor: { bg: 'bg-pink-50', text: 'text-pink-700', bar: 'bg-pink-500' },
    entertainment: { bg: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-indigo-500' },
    supplies: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  };

  // Items with alternatives
  const itemsWithAlternatives = items.filter((i) => i.suggestedAlternative);

  const handleApplyTip = (tip: SavingsTip) => {
    if (!appliedTips.includes(tip.title)) {
      setAppliedTips([...appliedTips, tip.title]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Banner */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border ${
          isOver
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        } shadow-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  isOver ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                }`}
              >
                {isOver ? '⚠️ Budget Alert' : '✨ Within Target'}
              </span>
              <span className="text-xs font-medium text-zinc-600">
                Target Cap: ${details.budget.toFixed(0)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Total Plan: ${totalCost.toFixed(2)}{' '}
              <span className="text-sm font-semibold opacity-80">
                ({isOver ? `$${diff.toFixed(2)} over budget` : `$${diff.toFixed(2)} remaining under cap`})
              </span>
            </h2>

            {budgetOptimization?.overallAnalysis && (
              <p className="text-xs sm:text-sm text-zinc-700 max-w-2xl pt-1">
                {budgetOptimization.overallAnalysis}
              </p>
            )}
          </div>

          {/* Quick Target Budget Adjuster */}
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs shrink-0 sm:w-64 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-600 uppercase">
              Adjust Target Budget Cap
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400 font-bold">$</span>
                <input
                  id="target-budget-adjust-input"
                  type="number"
                  min="20"
                  step="10"
                  value={targetBudgetInput}
                  onChange={(e) => setTargetBudgetInput(Number(e.target.value))}
                  className="w-full pl-6 pr-2 py-1 text-sm font-bold text-zinc-900 rounded-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                id="update-target-budget-btn"
                onClick={() => onUpdateBudget(targetBudgetInput)}
                className="px-3 py-1 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <PieChart className="w-4 h-4 text-amber-500" />
          <span>Category Cost Allocation</span>
        </h3>

        {/* Stacked Bar visual */}
        <div className="w-full h-4 rounded-full bg-zinc-100 overflow-hidden flex shadow-inner">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const pct = (amount / Math.max(1, totalCost)) * 100;
            const col = categoryColors[cat] || { bar: 'bg-zinc-400' };
            return (
              <div
                key={cat}
                className={`${col.bar} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${cat.toUpperCase()}: $${amount.toFixed(2)} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        {/* Categories cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const pct = (amount / Math.max(1, totalCost)) * 100;
            const count = items.filter((i) => i.category === cat).length;
            const col = categoryColors[cat] || { bg: 'bg-zinc-50', text: 'text-zinc-700' };

            return (
              <div
                key={cat}
                className={`${col.bg} p-3 rounded-xl border border-zinc-200/80 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase">
                  <span className={col.text}>{cat}</span>
                  <span className="text-[11px] text-zinc-500 font-normal">{count} items</span>
                </div>
                <div className="mt-2">
                  <div className="text-base font-black text-zinc-900">${amount.toFixed(0)}</div>
                  <div className="text-[11px] text-zinc-500">{pct.toFixed(1)}% of total</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-Click Item Cost Alternatives Swaps */}
      {itemsWithAlternatives.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                <span>Instant Cost-Cutting Item Swaps</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Replace premium items with high-value crowd-pleasing alternatives
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              {itemsWithAlternatives.length} Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {itemsWithAlternatives.map((item) => {
              const alt = item.suggestedAlternative!;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-white flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-500 uppercase line-through">
                        Current: {item.name} (${item.estimatedCost.toFixed(2)})
                      </span>
                      <span className="text-xs font-black text-emerald-600">
                        Save ${Math.abs(alt.costDiff).toFixed(2)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900">
                      Swap to: {alt.name}
                    </h4>

                    <p className="text-xs text-zinc-600">{alt.reason}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onApplyAlternative(item.id)}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Apply Swap & Save ${Math.abs(alt.costDiff).toFixed(0)}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Savings Strategies & Splurge Tips */}
      {budgetOptimization && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Savings Tips */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Smart Hosting Savings Hacks</span>
            </h3>

            <div className="space-y-2.5">
              {budgetOptimization.savingsTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">{tip.title}</span>
                    <span className="text-xs font-bold text-emerald-600">
                      ~${tip.potentialSavings} Potential
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">{tip.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* High Impact Splurge Recommendations */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>High-Impact Experience Splurges</span>
            </h3>

            <div className="space-y-2.5">
              {budgetOptimization.splurgeRecommendations.map((splurge, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">{splurge.title}</span>
                    <span className="text-xs font-bold text-amber-800">
                      +${splurge.extraCost}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">{splurge.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
