import React, { useState } from 'react';
import { PartyDetails } from '../types';
import { PARTY_PRESETS, PresetParty } from '../data/presets';
import { Sparkles, X, Users, DollarSign, Clock, Calendar, Check, AlertCircle, Wand2 } from 'lucide-react';

interface PartyIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (details: Partial<PartyDetails>) => Promise<void>;
  isLoading: boolean;
  initialDetails?: PartyDetails | null;
}

export const PartyIntakeModal: React.FC<PartyIntakeModalProps> = ({
  isOpen,
  onClose,
  onGeneratePlan,
  isLoading,
  initialDetails,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(initialDetails?.title || 'Summer Rooftop Fiesta');
  const [eventType, setEventType] = useState(initialDetails?.eventType || 'Birthday Party');
  const [theme, setTheme] = useState(initialDetails?.theme || 'Tropical Neon & Margaritas');
  const [guestCount, setGuestCount] = useState<number>(initialDetails?.guestCount || 16);
  const [adultCount, setAdultCount] = useState<number>(initialDetails?.adultCount || 16);
  const [kidCount, setKidCount] = useState<number>(initialDetails?.kidCount || 0);
  const [durationHours, setDurationHours] = useState<number>(initialDetails?.durationHours || 4);
  const [budget, setBudget] = useState<number>(initialDetails?.budget || 280);
  const [mealType, setMealType] = useState<PartyDetails['mealType']>(
    initialDetails?.mealType || 'appetizers_cocktails'
  );
  const [venueType, setVenueType] = useState<PartyDetails['venueType']>(
    initialDetails?.venueType || 'indoor_home'
  );
  const [dietary, setDietary] = useState<string[]>(initialDetails?.dietaryRestrictions || []);
  const [vibeDescription, setVibeDescription] = useState(
    initialDetails?.vibeDescription || 'Vibrant, high-energy playlist, colorful finger foods, craft cocktails'
  );
  const [customRequests, setCustomRequests] = useState(
    initialDetails?.customRequests || ''
  );

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PresetParty) => {
    setSelectedPreset(preset.id);
    setTitle(preset.details.title);
    setEventType(preset.details.eventType);
    setTheme(preset.details.theme);
    setGuestCount(preset.details.guestCount);
    setAdultCount(preset.details.adultCount);
    setKidCount(preset.details.kidCount);
    setDurationHours(preset.details.durationHours);
    setBudget(preset.details.budget);
    setMealType(preset.details.mealType);
    setVenueType(preset.details.venueType);
    setDietary(preset.details.dietaryRestrictions || []);
    setVibeDescription(preset.details.vibeDescription || '');
    setCustomRequests(preset.details.customRequests || '');
  };

  const handleGuestCountChange = (val: number) => {
    const total = Math.max(1, val);
    setGuestCount(total);
    // adjust adult/kid proportionally if kid count is zero
    if (kidCount === 0) {
      setAdultCount(total);
    } else {
      const kids = Math.min(kidCount, total - 1);
      setKidCount(kids);
      setAdultCount(total - kids);
    }
  };

  const toggleDietaryOption = (opt: string) => {
    if (dietary.includes(opt)) {
      setDietary(dietary.filter((d) => d !== opt));
    } else {
      setDietary([...dietary, opt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGeneratePlan({
      title,
      eventType,
      theme,
      guestCount,
      adultCount,
      kidCount,
      durationHours,
      budget,
      mealType,
      venueType,
      dietaryRestrictions: dietary,
      vibeDescription,
      customRequests,
    });
  };

  const dietaryOptions = [
    'Vegetarian options',
    'Vegan friendly',
    'Gluten-Free snacks',
    'Nut-Free (Allergy safe)',
    'Dairy-Free / Lactose-Free',
    'Alcohol-Free / Mocktail focused',
    'Halal options',
    'Kosher options',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  CymbalMart Party Planner
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                  CUJ Step 1: Define Event
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                {initialDetails ? 'Update Party Specs & Constraints' : 'Define Party Event & Shopping Intent'}
              </h2>
              <p className="text-xs text-zinc-500">
                Specify party type, theme, budget, guest count & special dietary constraints
              </p>
            </div>
          </div>
          <button
            id="close-party-intake-modal-btn"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Starter Templates */}
          {!initialDetails && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2.5">
                ⚡ Or Start from a Popular Theme Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PARTY_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="text-xl mb-1">{preset.emoji}</div>
                      <div className="font-semibold text-xs text-zinc-900 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{preset.tagline}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form id="party-intake-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Party Title
                </label>
                <input
                  id="party-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leo's 30th Birthday Bash"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Event Type
                </label>
                <select
                  id="party-event-type-select"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Cocktail Party / Soirée">Cocktail Party / Soirée</option>
                  <option value="Dinner Party / Gathering">Dinner Party / Gathering</option>
                  <option value="BBQ Cookout">BBQ Cookout</option>
                  <option value="Kids Birthday Party">Kids Birthday Party</option>
                  <option value="Game Night / Watch Party">Game Night / Watch Party</option>
                  <option value="Baby / Bridal Shower">Baby / Bridal Shower</option>
                  <option value="Housewarming">Housewarming</option>
                  <option value="Holiday Dinner / Feast">Holiday Dinner / Feast</option>
                  <option value="Casual Gathering">Casual Gathering</option>
                </select>
              </div>
            </div>

            {/* Theme & Vibe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Theme & Style
                </label>
                <input
                  id="party-theme-input"
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Retro 80s Disco, Rustic Italian, Elegant Glow"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Target Budget ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-sm text-zinc-400 font-bold">$</span>
                  <input
                    id="party-budget-input"
                    type="number"
                    min="20"
                    max="10000"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Guest Counts & Duration */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  Total Guests
                </label>
                <input
                  id="party-total-guests-input"
                  type="number"
                  min="2"
                  max="500"
                  value={guestCount}
                  onChange={(e) => handleGuestCountChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-bold text-zinc-900 rounded-md border border-zinc-300 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  Adults (21+)
                </label>
                <input
                  id="party-adult-count-input"
                  type="number"
                  min="0"
                  max={guestCount}
                  value={adultCount}
                  onChange={(e) => {
                    const adults = Number(e.target.value);
                    setAdultCount(adults);
                    setKidCount(Math.max(0, guestCount - adults));
                  }}
                  className="w-full px-3 py-1.5 text-sm font-semibold text-zinc-800 rounded-md border border-zinc-300 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  Kids / Teens
                </label>
                <input
                  id="party-kid-count-input"
                  type="number"
                  min="0"
                  max={guestCount}
                  value={kidCount}
                  onChange={(e) => {
                    const kids = Number(e.target.value);
                    setKidCount(kids);
                    setAdultCount(Math.max(0, guestCount - kids));
                  }}
                  className="w-full px-3 py-1.5 text-sm font-semibold text-zinc-800 rounded-md border border-zinc-300 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  Duration (Hrs)
                </label>
                <input
                  id="party-duration-input"
                  type="number"
                  min="1"
                  max="12"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-semibold text-zinc-800 rounded-md border border-zinc-300 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            {/* Food Style & Venue Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Meal / Refreshment Level
                </label>
                <select
                  id="party-meal-type-select"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="appetizers_cocktails">Heavy Appetizers & Cocktails (Finger foods)</option>
                  <option value="full_meal">Full Dinner / Buffet (Proteins, sides, salads)</option>
                  <option value="bbq_cookout">Backyard BBQ Cookout (Burgers, ribs, grilled items)</option>
                  <option value="snacks_drinks">Casual Snacks & Beverages (Chips, dips, grazing)</option>
                  <option value="dessert_coffee">Dessert Bar & Sweets (Cakes, cupcakes, fruit)</option>
                  <option value="byob_party">BYOB & Appetizers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Venue Type
                </label>
                <select
                  id="party-venue-type-select"
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="indoor_home">Indoor Home / Living Room</option>
                  <option value="backyard">Backyard / Patio / Garden</option>
                  <option value="park_outdoor">Public Park / Outdoor Pavilion</option>
                  <option value="rented_venue">Rented Event Hall / Club House</option>
                </select>
              </div>
            </div>

            {/* Dietary Needs */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Dietary Preferences & Allergy Needs
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((opt) => {
                  const isSelected = dietary.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleDietaryOption(opt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vibe / Atmosphere description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Vibe & Atmosphere Notes
              </label>
              <input
                id="party-vibe-input"
                type="text"
                value={vibeDescription}
                onChange={(e) => setVibeDescription(e.target.value)}
                placeholder="e.g. Candlelit cozy chill, upscale champagne toast, or kids loud fun"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Custom Requests */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Special Requests or Must-Haves
              </label>
              <textarea
                id="party-custom-requests-input"
                rows={2}
                value={customRequests}
                onChange={(e) => setCustomRequests(e.target.value)}
                placeholder="e.g. Must include a signature smoked cocktail, specific photo backdrop, gluten-free dessert..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {guestCount} guests • {durationHours} hours • ${budget} budget
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="cancel-party-intake-btn"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="party-intake-form"
              id="generate-party-plan-submit-btn"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Planning with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{initialDetails ? 'Update Shopping Plan' : 'Generate Party Shopping List'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
