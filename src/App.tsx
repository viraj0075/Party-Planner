import React, { useState, useEffect } from 'react';
import {
  PartyPlan,
  ShoppingItem,
  PartyDetails,
  TimelineStep,
  SignatureRecipe,
} from './types';
import { PARTY_PRESETS } from './data/presets';
import {
  loadSavedPlans,
  savePlansToStorage,
  loadActivePlanId,
  saveActivePlanId,
} from './utils/storage';
import { Header } from './components/Header';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { PartyBanner } from './components/PartyBanner';
import { ShoppingListView } from './components/ShoppingListView';
import { StoreBreakdownView } from './components/StoreBreakdownView';
import { PortionCalculatorView } from './components/PortionCalculatorView';
import { BudgetOptimizerView } from './components/BudgetOptimizerView';
import { ShoppingTimelineView } from './components/ShoppingTimelineView';
import { PartyIntakeModal } from './components/PartyIntakeModal';
import { AddItemModal } from './components/AddItemModal';
import { EditItemModal } from './components/EditItemModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { RecipeModal } from './components/RecipeModal';
import { CheckoutModal } from './components/CheckoutModal';
import { MessageSquare, Bot, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [plans, setPlans] = useState<PartyPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('shopping-list');

  // Modals & Drawers
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isEditPartyOpen, setIsEditPartyOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingRecipe, setIsRegeneratingRecipe] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Initialize plans from storage or load initial preset
  useEffect(() => {
    const saved = loadSavedPlans();
    const activeId = loadActivePlanId();

    if (saved && saved.length > 0) {
      setPlans(saved);
      const match = saved.find((p) => p.details.id === activeId);
      setActivePlanId(match ? match.details.id : saved[0].details.id);
    } else {
      // Initialize with default preset
      initDefaultPlan();
    }
  }, []);

  const initDefaultPlan = async () => {
    setIsGenerating(true);
    try {
      const preset = PARTY_PRESETS[0]; // Taco Fiesta
      const res = await fetch('/api/plan-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset.details),
      });
      const data = await res.json();
      setPlans([data]);
      setActivePlanId(data.details.id);
      savePlansToStorage([data]);
      saveActivePlanId(data.details.id);
    } catch (e) {
      console.error('Failed to init default party plan:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPlan = plans.find((p) => p.details.id === activePlanId) || plans[0] || null;

  const updateCurrentPlan = (updater: (prev: PartyPlan) => PartyPlan) => {
    if (!currentPlan) return;
    const updated = updater(currentPlan);
    const newPlans = plans.map((p) => (p.details.id === currentPlan.details.id ? updated : p));
    setPlans(newPlans);
    savePlansToStorage(newPlans);
  };

  // Item Handlers
  const handleToggleCheck = (id: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)),
    }));
  };

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
  };

  const handleSaveEditedItem = (updated: ShoppingItem) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === updated.id ? updated : it)),
    }));
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleAddItem = (newItem: Omit<ShoppingItem, 'id' | 'checked'>) => {
    const item: ShoppingItem = {
      ...newItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      checked: false,
    };
    updateCurrentPlan((prev) => ({
      ...prev,
      items: [item, ...prev.items],
    }));
  };

  const handleApplyAlternative = (itemId: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === itemId && it.suggestedAlternative) {
          const newCost = Math.max(1, it.estimatedCost + it.suggestedAlternative.costDiff);
          return {
            ...it,
            name: it.suggestedAlternative.name,
            estimatedCost: newCost,
            notes: `Swapped for cost savings: ${it.suggestedAlternative.reason}`,
            suggestedAlternative: undefined,
          };
        }
        return it;
      }),
    }));

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#059669'],
    });
  };

  const handleBulkCheck = (checked: boolean) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      items: prev.items.map((it) => ({ ...it, checked })),
    }));
  };

  // Plan generation / creation
  const handleGeneratePlan = async (details: Partial<PartyDetails>) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/plan-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      const newPlan = await res.json();

      let updatedPlans: PartyPlan[];
      if (isEditPartyOpen && currentPlan) {
        // replace existing
        updatedPlans = plans.map((p) => (p.details.id === currentPlan.details.id ? newPlan : p));
      } else {
        // add new
        updatedPlans = [newPlan, ...plans];
      }

      setPlans(updatedPlans);
      setActivePlanId(newPlan.details.id);
      savePlansToStorage(updatedPlans);
      saveActivePlanId(newPlan.details.id);
      setIsIntakeModalOpen(false);
      setIsEditPartyOpen(false);
      setActiveTab('shopping-list');

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.error('Error creating plan:', e);
      alert('Failed to generate party plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPlan = (id: string) => {
    setActivePlanId(id);
    saveActivePlanId(id);
  };

  const handleUpdateBudget = (newBudget: number) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      details: { ...prev.details, budget: newBudget },
    }));
  };

  // Sync portion math back to party
  const handleSyncPortionsToPlan = (updatedGuests: number, updatedHours: number, updatedMeal: string) => {
    updateCurrentPlan((prev) => {
      const oldGuests = prev.details.guestCount || 1;
      const ratio = updatedGuests / oldGuests;

      // Proportional item quantity adjustment for food and drink
      const updatedItems = prev.items.map((it) => {
        if (it.category === 'food' || it.category === 'drinks' || it.category === 'supplies') {
          const newQty = Math.max(1, Math.round(it.quantity * ratio));
          const newCost = Math.max(1, Math.round(it.estimatedCost * ratio * 100) / 100);
          return {
            ...it,
            quantity: newQty,
            estimatedCost: newCost,
          };
        }
        return it;
      });

      return {
        ...prev,
        details: {
          ...prev.details,
          guestCount: updatedGuests,
          adultCount: Math.round(updatedGuests * (prev.details.adultCount / Math.max(1, oldGuests))),
          kidCount: Math.max(0, updatedGuests - Math.round(updatedGuests * (prev.details.adultCount / Math.max(1, oldGuests)))),
          durationHours: updatedHours,
          mealType: updatedMeal as any,
        },
        items: updatedItems,
      };
    });
  };

  // Timeline handlers
  const handleToggleTimelineTask = (stepId: string, taskId: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.map((st) => {
        if (st.id === stepId) {
          return {
            ...st,
            tasks: st.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
          };
        }
        return st;
      }),
    }));
  };

  const handleAddTimelineTask = (stepId: string, taskText: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.map((st) => {
        if (st.id === stepId) {
          return {
            ...st,
            tasks: [
              ...st.tasks,
              { id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, text: taskText, completed: false },
            ],
          };
        }
        return st;
      }),
    }));
  };

  const handleDeleteTimelineTask = (stepId: string, taskId: string) => {
    updateCurrentPlan((prev) => ({
      ...prev,
      timeline: prev.timeline.map((st) => {
        if (st.id === stepId) {
          return {
            ...st,
            tasks: st.tasks.filter((t) => t.id !== taskId),
          };
        }
        return st;
      }),
    }));
  };

  // Signature Recipe handlers
  const handleAddIngredientsToShoppingList = (
    ingredients: { name: string; amount: string; estimatedCost?: number }[]
  ) => {
    const newItems: ShoppingItem[] = ingredients.map((ing, idx) => ({
      id: `recipe-item-${Date.now()}-${idx}`,
      name: ing.name,
      category: 'drinks',
      quantity: 1,
      unit: ing.amount,
      estimatedCost: ing.estimatedCost || 8,
      checked: false,
      store: "Trader Joe's",
      priority: 'must-have',
      notes: `For signature drink: ${currentPlan?.signatureRecipe?.title || 'Party Cocktail'}`,
    }));

    updateCurrentPlan((prev) => ({
      ...prev,
      items: [...newItems, ...prev.items],
    }));
  };

  const handleRegenerateRecipe = async (type: 'cocktail' | 'mocktail' | 'dish') => {
    if (!currentPlan) return;
    setIsRegeneratingRecipe(true);
    try {
      const res = await fetch('/api/suggest-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyDetails: currentPlan.details,
          recipeType: type,
        }),
      });
      const newRecipe = await res.json();
      updateCurrentPlan((prev) => ({
        ...prev,
        signatureRecipe: newRecipe,
      }));
    } catch (e) {
      console.error('Error generating recipe:', e);
    } finally {
      setIsRegeneratingRecipe(false);
    }
  };

  // Agent Chat batch add items
  const handleAddItemsFromChat = (newItems: Partial<ShoppingItem>[]) => {
    const itemsToAdd: ShoppingItem[] = newItems.map((it, idx) => ({
      id: `chat-item-${Date.now()}-${idx}`,
      name: it.name || 'Party Item',
      category: it.category || 'food',
      quantity: it.quantity || 1,
      unit: it.unit || 'pack',
      estimatedCost: it.estimatedCost || 10,
      checked: false,
      store: (it.store as any) || 'Supermarket / Grocery',
      priority: it.priority || 'must-have',
      notes: it.notes || 'Added by AI Copilot',
      portionBasis: it.portionBasis,
    }));

    updateCurrentPlan((prev) => ({
      ...prev,
      items: [...itemsToAdd, ...prev.items],
    }));

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const unpurchasedCount = currentPlan
    ? currentPlan.items.filter((i) => !i.checked).length
    : 0;
  const uniqueStoresCount = currentPlan
    ? new Set(currentPlan.items.map((i) => i.store)).size
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 flex flex-col font-sans selection:bg-amber-500/20">
      {/* Top Header */}
      <Header
        currentPlan={currentPlan}
        allPlans={plans}
        onSelectPlan={handleSelectPlan}
        onNewParty={() => setIsIntakeModalOpen(true)}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenRecipe={() => setIsRecipeModalOpen(true)}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
        isChatOpen={isChatOpen}
        copiedToast={copiedToast}
        onShowCopiedToast={() => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2500);
        }}
      />

      {/* Tabs Navigation */}
      {currentPlan && (
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalItems={currentPlan.items.length}
          unpurchasedCount={unpurchasedCount}
          totalStores={uniqueStoresCount}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentPlan ? (
          <div>
            {/* Party Overview Banner */}
            <PartyBanner
              plan={currentPlan}
              onEditParty={() => setIsEditPartyOpen(true)}
              onOpenCheckout={() => setIsCheckoutModalOpen(true)}
            />

            {/* Active Tab View */}
            {activeTab === 'shopping-list' && (
              <ShoppingListView
                items={currentPlan.items}
                onToggleCheck={handleToggleCheck}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onApplyAlternative={handleApplyAlternative}
                onOpenAddItem={() => setIsAddItemModalOpen(true)}
                onBulkCheck={handleBulkCheck}
              />
            )}

            {activeTab === 'store-routes' && (
              <StoreBreakdownView
                items={currentPlan.items}
                onToggleCheck={handleToggleCheck}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onApplyAlternative={handleApplyAlternative}
              />
            )}

            {activeTab === 'portion-calc' && (
              <PortionCalculatorView
                plan={currentPlan}
                onSyncPortionsToPlan={handleSyncPortionsToPlan}
              />
            )}

            {activeTab === 'budget-optimizer' && (
              <BudgetOptimizerView
                plan={currentPlan}
                onApplyAlternative={handleApplyAlternative}
                onUpdateBudget={handleUpdateBudget}
              />
            )}

            {activeTab === 'timeline-schedule' && (
              <ShoppingTimelineView
                timeline={currentPlan.timeline}
                onToggleTask={handleToggleTimelineTask}
                onAddTask={handleAddTimelineTask}
                onDeleteTask={handleDeleteTimelineTask}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs">
            <h2 className="text-xl font-bold text-zinc-900">No Party Plan Loaded</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
              Get started by creating a custom party plan or choosing one of our curated party presets!
            </p>
            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="mt-6 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              Plan a Party with AI
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Party Planner Shopping Agent • Powered by Gemini 3.7 Flash</span>
          <div className="flex items-center gap-4 text-zinc-500 font-medium">
            <span>Portion Math Engine</span>
            <span>•</span>
            <span>Store Routing</span>
            <span>•</span>
            <span>Budget Optimizer</span>
          </div>
        </div>
      </footer>

      {/* Party Intake Wizard / Modal (New or Edit) */}
      <PartyIntakeModal
        isOpen={isIntakeModalOpen || isEditPartyOpen}
        onClose={() => {
          setIsIntakeModalOpen(false);
          setIsEditPartyOpen(false);
        }}
        onGeneratePlan={handleGeneratePlan}
        isLoading={isGenerating}
        initialDetails={isEditPartyOpen && currentPlan ? currentPlan.details : null}
      />

      {/* Add Custom Item Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddItem}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEditedItem}
      />

      {/* AI Copilot Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plan={currentPlan}
        onAddItemsFromChat={handleAddItemsFromChat}
        onUpdateBudgetFromChat={handleUpdateBudget}
      />

      {/* Signature Recipe Modal */}
      <RecipeModal
        recipe={currentPlan?.signatureRecipe || null}
        partyDetails={currentPlan?.details || null}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onAddIngredientsToShoppingList={handleAddIngredientsToShoppingList}
        onRegenerateRecipe={handleRegenerateRecipe}
        isRegenerating={isRegeneratingRecipe}
      />

      {/* Checkout & Finalize Modal (CUJ Step 3) */}
      {currentPlan && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          plan={currentPlan}
          onMarkAllPurchased={() => handleBulkCheck(true)}
        />
      )}
      {/* Floating CymbalMart Assistant Chat Widget Button */}
      {!isChatOpen && (
        <button
          id="floating-cymbalmart-assistant-btn"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-xs sm:text-sm border-2 border-amber-300/40 group cursor-pointer"
          title="Open CymbalMart Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="tracking-tight">Chat with CymbalMart Assistant</span>
        </button>
      )}
    </div>
  );
}
