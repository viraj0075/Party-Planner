export type ItemCategory = 'food' | 'drinks' | 'decor' | 'entertainment' | 'supplies';

export type StoreType =
  | 'Costco / Wholesale'
  | "Trader Joe's"
  | 'Supermarket / Grocery'
  | 'Target / Retail'
  | 'Party City / Amazon'
  | 'Liquor Store'
  | 'Local Bakery / Deli'
  | 'General / Other';

export type ItemPriority = 'must-have' | 'nice-to-have' | 'backup';

export interface AlternativeSuggestion {
  name: string;
  costDiff: number; // e.g. -15 for $15 savings
  reason: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  estimatedCost: number;
  checked: boolean;
  store: StoreType;
  notes?: string;
  priority: ItemPriority;
  portionBasis?: string;
  suggestedAlternative?: AlternativeSuggestion;
}

export interface PartyDetails {
  id: string;
  title: string;
  eventType: string;
  theme: string;
  guestCount: number;
  adultCount: number;
  kidCount: number;
  durationHours: number;
  budget: number;
  mealType: 'full_meal' | 'appetizers_cocktails' | 'snacks_drinks' | 'bbq_cookout' | 'dessert_coffee' | 'byob_party';
  venueType: 'indoor_home' | 'backyard' | 'park_outdoor' | 'rented_venue';
  dietaryRestrictions: string[];
  vibeDescription?: string;
  customRequests?: string;
  createdAt: string;
}

export interface PortionMetric {
  id: string;
  category: string;
  item: string;
  calculation: string;
  ruleExplanation: string;
  recommendedAmount: string;
}

export interface TimelineStep {
  id: string;
  timeframe: '2_weeks_prior' | '1_week_prior' | '2_days_prior' | '1_day_prior' | 'day_of_morning';
  timeframeLabel: string;
  title: string;
  description: string;
  tasks: { id: string; text: string; completed: boolean }[];
}

export interface SavingsTip {
  title: string;
  potentialSavings: number;
  action: string;
}

export interface SplurgeTip {
  title: string;
  extraCost: number;
  impact: string;
}

export interface BudgetOptimization {
  overallAnalysis: string;
  savingsTips: SavingsTip[];
  splurgeRecommendations: SplurgeTip[];
}

export interface SignatureRecipe {
  title: string;
  description: string;
  type: 'cocktail' | 'mocktail' | 'punch' | 'dish' | 'snack';
  servings: number;
  ingredients: { name: string; amount: string; estimatedCost?: number }[];
  instructions: string[];
  tips?: string;
}

export interface PartyPlan {
  details: PartyDetails;
  items: ShoppingItem[];
  portionMetrics: PortionMetric[];
  timeline: TimelineStep[];
  budgetOptimization?: BudgetOptimization;
  signatureRecipe?: SignatureRecipe;
}

export interface ChatActionPayload {
  type: 'add_items' | 'adjust_budget' | 'apply_dietary' | 'update_quantities' | 'add_recipe_items';
  items?: Partial<ShoppingItem>[];
  budget?: number;
  message?: string;
  recipe?: SignatureRecipe;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionPayload?: ChatActionPayload;
}
