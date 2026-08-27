import React, { useState } from 'react';
import { PartyPlan, PortionMetric } from '../types';
import { PORTION_RULES } from '../utils/portionMath';
import {
  Calculator,
  Wine,
  Utensils,
  Snowflake,
  Cake,
  PackageCheck,
  RefreshCw,
  Info,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface PortionCalculatorViewProps {
  plan: PartyPlan;
  onSyncPortionsToPlan: (updatedGuests: number, updatedHours: number, updatedMeal: string) => void;
}

export const PortionCalculatorView: React.FC<PortionCalculatorViewProps> = ({
  plan,
  onSyncPortionsToPlan,
}) => {
  const [guests, setGuests] = useState<number>(plan.details.guestCount);
  const [adults, setAdults] = useState<number>(plan.details.adultCount);
  const [kids, setKids] = useState<number>(plan.details.kidCount);
  const [hours, setHours] = useState<number>(plan.details.durationHours);
  const [mealType, setMealType] = useState<string>(plan.details.mealType);
  const [isSyncedToast, setIsSyncedToast] = useState(false);

  const handleTotalGuestsChange = (total: number) => {
    const val = Math.max(1, total);
    setGuests(val);
    if (kids === 0) {
      setAdults(val);
    } else {
      const k = Math.min(kids, val - 1);
      setKids(k);
      setAdults(val - k);
    }
  };

  const handleSync = () => {
    onSyncPortionsToPlan(guests, hours, mealType);
    setIsSyncedToast(true);
    setTimeout(() => setIsSyncedToast(false), 3000);
  };

  // Run portion rules
  const calculatedResults = PORTION_RULES.map((rule) => {
    return {
      ruleName: rule.name,
      category: rule.category,
      result: rule.calculate(guests, adults, kids, hours, mealType),
    };
  });

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Interactive Portion Math & Quantity Engine
              </h2>
              <p className="text-xs text-zinc-500">
                Scientific party catering math to guarantee you never run out of food, alcohol, or ice!
              </p>
            </div>
          </div>

          <button
            type="button"
            id="sync-portions-btn"
            onClick={handleSync}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Apply Quantities to Shopping List</span>
          </button>
        </div>

        {isSyncedToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Successfully synced portion math and updated party specs!</span>
          </div>
        )}

        {/* Dynamic Controls / Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-100 bg-zinc-50/60 p-4 rounded-xl">
          {/* Guest Count Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span>Total Guests</span>
              </span>
              <span className="text-sm font-bold text-amber-600">{guests} guests</span>
            </div>
            <input
              id="slider-guests"
              type="range"
              min="2"
              max="100"
              value={guests}
              onChange={(e) => handleTotalGuestsChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>{adults} adults</span>
              <span>{kids} kids</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Party Duration</span>
              </span>
              <span className="text-sm font-bold text-amber-600">{hours} hours</span>
            </div>
            <input
              id="slider-hours"
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1 hr</span>
              <span>4 hrs (std)</span>
              <span>8 hrs</span>
            </div>
          </div>

          {/* Meal Type Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Meal / Refreshment Format
            </label>
            <select
              id="select-portion-meal-type"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="appetizers_cocktails">Heavy Appetizers & Drinks</option>
              <option value="full_meal">Full Dinner Buffet</option>
              <option value="bbq_cookout">Backyard BBQ Cookout</option>
              <option value="snacks_drinks">Casual Snacks & Soda</option>
              <option value="dessert_coffee">Dessert & Coffee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calculated Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculatedResults.map((item, idx) => {
          const getCategoryIcon = (cat: string) => {
            if (cat === 'Beverages') return <Wine className="w-4 h-4 text-purple-600" />;
            if (cat === 'Chilling') return <Snowflake className="w-4 h-4 text-cyan-600" />;
            if (cat === 'Food') return <Utensils className="w-4 h-4 text-orange-600" />;
            if (cat === 'Dessert') return <Cake className="w-4 h-4 text-pink-600" />;
            return <PackageCheck className="w-4 h-4 text-blue-600" />;
          };

          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                    Rule-Based
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-zinc-900">{item.ruleName}</h3>

                <div className="mt-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="text-sm sm:text-base font-bold text-amber-900">
                    {item.result.displayText}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-start gap-1.5 text-xs text-zinc-500">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>{item.result.explanation}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hosting Pro Tips Grid */}
      <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 space-y-3">
        <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Golden Hosting Guidelines</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600">
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <strong className="text-zinc-900 block mb-1">🍸 The 2+1 Bar Rule:</strong>
            Plan 2 drinks per guest in the first hour when everyone arrives, and 1 drink per hour after that.
          </div>
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <strong className="text-zinc-900 block mb-1">🧊 The 1.5 lb Ice Rule:</strong>
            Allocate 1 lb of ice per person for chilling drink bottles in tubs, plus 0.5 lb of clean ice for glass service.
          </div>
          <div className="bg-white p-3 rounded-xl border border-zinc-200">
            <strong className="text-zinc-900 block mb-1">🍽️ Appetizer vs Dinner:</strong>
            If dinner is not served, guests need 8-12 pieces each. If dinner is served, 3-4 light pieces is plenty.
          </div>
        </div>
      </div>
    </div>
  );
};
