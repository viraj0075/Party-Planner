import React from 'react';
import { PartyPlan } from '../types';
import { Users, Clock, MapPin, Utensils, Sparkles, AlertCircle, Edit3 } from 'lucide-react';

interface PartyBannerProps {
  plan: PartyPlan;
  onEditParty: () => void;
  onOpenCheckout?: () => void;
}

export const PartyBanner: React.FC<PartyBannerProps> = ({ plan, onEditParty, onOpenCheckout }) => {
  const { details, items } = plan;
  const totalEstimated = items.reduce((acc, it) => acc + it.estimatedCost, 0);
  const checkedCost = items.filter((it) => it.checked).reduce((acc, it) => acc + it.estimatedCost, 0);
  const remainingCost = totalEstimated - checkedCost;
  const isOverBudget = totalEstimated > details.budget;

  const mealLabels: Record<string, string> = {
    full_meal: 'Full Meal / Dinner',
    appetizers_cocktails: 'Cocktails & Heavy Appetizers',
    snacks_drinks: 'Snacks & Beverages',
    bbq_cookout: 'BBQ Cookout & Sides',
    dessert_coffee: 'Desserts & Sweets',
    byob_party: 'BYOB & Finger Foods',
  };

  const venueLabels: Record<string, string> = {
    indoor_home: 'Home / Living Room',
    backyard: 'Backyard / Patio',
    park_outdoor: 'Public Park / Outdoors',
    rented_venue: 'Rented Venue / Hall',
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs relative overflow-hidden">
      {/* Decorative festive subtle background circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{details.eventType}</span>
            </span>
            <span className="text-xs font-medium text-amber-900/70 bg-amber-100/60 px-2.5 py-1 rounded-full">
              Theme: {details.theme}
            </span>
            <button
              id="edit-party-details-btn"
              onClick={onEditParty}
              className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 bg-white/80 hover:bg-white border border-zinc-200 px-2.5 py-1 rounded-full transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Details</span>
            </button>
          </div>

          {/* CUJ Workflow Progress Indicators */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              CymbalMart Journey:
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
              ✓ 1. Event Defined
            </span>
            <span className="text-zinc-300">→</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
              ⚡ 2. Review & Align Budget
            </span>
            <span className="text-zinc-300">→</span>
            {onOpenCheckout ? (
              <button
                id="banner-refine-checkout-btn"
                onClick={onOpenCheckout}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-zinc-700 hover:text-emerald-700 hover:border-emerald-300 border border-zinc-200 px-2 py-0.5 rounded-md shadow-xs transition-colors"
              >
                <span>3. Refine & Checkout →</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
                3. Refine & Checkout
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {details.title}
          </h2>

          {details.vibeDescription && (
            <p className="text-sm text-zinc-600 max-w-2xl">
              {details.vibeDescription}
            </p>
          )}

          {/* Quick Specs badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-zinc-700 font-medium pt-1">
            <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-100">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {details.guestCount} Guests ({details.adultCount} adults
                {details.kidCount > 0 ? `, ${details.kidCount} kids` : ''})
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-100">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{details.durationHours} Hours</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-100">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>{mealLabels[details.mealType] || details.mealType}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-100">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{venueLabels[details.venueType] || details.venueType}</span>
            </div>
          </div>

          {/* Dietary tags */}
          {details.dietaryRestrictions && details.dietaryRestrictions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                Dietary notes:
              </span>
              {details.dietaryRestrictions.map((diet, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                >
                  🌱 {diet}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Financial Quick Stat Card */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs lg:w-72 shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>Budget Overview</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isOverBudget ? 'Over Budget' : 'On Track'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-zinc-900">${totalEstimated.toFixed(0)}</span>
              <span className="text-xs text-zinc-500 font-medium">Target: ${details.budget}</span>
            </div>

            {/* Visual bar */}
            <div className="w-full bg-zinc-100 h-2 rounded-full mt-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (checkedCost / Math.max(1, totalEstimated)) * 100)}%` }}
                title={`Purchased: $${checkedCost.toFixed(0)}`}
              />
              <div
                className={`h-full transition-all duration-300 ${isOverBudget ? 'bg-rose-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.max(0, Math.min(100 - (checkedCost / Math.max(1, totalEstimated)) * 100, (remainingCost / Math.max(1, totalEstimated)) * 100))}%` }}
                title={`Remaining to buy: $${remainingCost.toFixed(0)}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 text-xs">
            <div>
              <span className="text-zinc-500 text-[11px] block">Purchased</span>
              <span className="font-bold text-emerald-600">${checkedCost.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">To Buy</span>
              <span className="font-bold text-zinc-800">${remainingCost.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
