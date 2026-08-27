import React, { useState } from 'react';
import { SignatureRecipe, ShoppingItem, PartyDetails } from '../types';
import { GlassWater, X, PlusCircle, Check, Sparkles, ChefHat, RefreshCw } from 'lucide-react';

interface RecipeModalProps {
  recipe: SignatureRecipe | null;
  partyDetails: PartyDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAddIngredientsToShoppingList: (ingredients: { name: string; amount: string; estimatedCost?: number }[]) => void;
  onRegenerateRecipe: (type: 'cocktail' | 'mocktail' | 'dish') => Promise<void>;
  isRegenerating: boolean;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  partyDetails,
  isOpen,
  onClose,
  onAddIngredientsToShoppingList,
  onRegenerateRecipe,
  isRegenerating,
}) => {
  const [addedToast, setAddedToast] = useState(false);
  const [selectedType, setSelectedType] = useState<'cocktail' | 'mocktail' | 'dish'>(
    recipe?.type === 'mocktail' ? 'mocktail' : recipe?.type === 'dish' ? 'dish' : 'cocktail'
  );

  if (!isOpen || !recipe) return null;

  const handleAddAll = () => {
    onAddIngredientsToShoppingList(recipe.ingredients);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleTypeChange = async (type: 'cocktail' | 'mocktail' | 'dish') => {
    setSelectedType(type);
    await onRegenerateRecipe(type);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 animate-scale-in space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <GlassWater className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Party Signature Recipe
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                {recipe.title}
              </h3>
            </div>
          </div>
          <button
            id="close-recipe-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Type Switcher */}
        <div className="flex items-center justify-between bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTypeChange('cocktail')}
            disabled={isRegenerating}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              selectedType === 'cocktail'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            🍸 Signature Cocktail
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('mocktail')}
            disabled={isRegenerating}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              selectedType === 'mocktail'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            🍹 Zero-Proof Mocktail
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('dish')}
            disabled={isRegenerating}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              selectedType === 'dish'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            🌮 Themed Appetizer
          </button>
        </div>

        {isRegenerating ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">Creating custom themed recipe...</p>
          </div>
        ) : (
          <>
            {/* Description & Servings */}
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
              <p className="text-xs sm:text-sm text-amber-950 italic">{recipe.description}</p>
              <div className="mt-2 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Scaled For: {recipe.servings} Party Guests
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 uppercase tracking-wider">
                <span>Ingredients</span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  {recipe.ingredients.length} items
                </span>
              </div>

              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 space-y-1.5 max-h-44 overflow-y-auto">
                {recipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/60 last:border-none"
                  >
                    <span className="font-semibold text-zinc-800">{ing.name}</span>
                    <span className="text-zinc-600 font-mono text-[11px]">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Preparation Steps
              </h4>
              <div className="space-y-2 text-xs text-zinc-700">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip */}
            {recipe.tips && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2">
                <ChefHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 block mb-0.5">Host Pro Tip:</strong>
                  <span>{recipe.tips}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {addedToast ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Added ingredients to your shopping checklist!
            </span>
          ) : (
            <span className="text-[11px] text-zinc-400">
              Adds missing spirits, produce & mixers to list
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="close-recipe-btn"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100"
            >
              Close
            </button>
            <button
              type="button"
              id="add-recipe-ingredients-btn"
              onClick={handleAddAll}
              disabled={isRegenerating}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to Shopping List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
