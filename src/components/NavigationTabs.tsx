import React from 'react';
import { ShoppingCart, Store, Calculator, DollarSign, CalendarClock } from 'lucide-react';

export type ActiveTab = 'shopping-list' | 'store-routes' | 'portion-calc' | 'budget-optimizer' | 'timeline-schedule';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalItems: number;
  unpurchasedCount: number;
  totalStores: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  totalItems,
  unpurchasedCount,
  totalStores,
}) => {
  const tabs = [
    {
      id: 'shopping-list' as ActiveTab,
      label: 'Curated Shopping List',
      icon: ShoppingCart,
      badge: unpurchasedCount > 0 ? `${unpurchasedCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'budget-optimizer' as ActiveTab,
      label: 'Budget & Cost Swaps',
      icon: DollarSign,
    },
    {
      id: 'store-routes' as ActiveTab,
      label: 'CymbalMart Aisle Routing',
      icon: Store,
      badge: totalStores > 0 ? `${totalStores} aisles` : undefined,
      badgeColor: 'bg-zinc-100 text-zinc-700',
    },
    {
      id: 'portion-calc' as ActiveTab,
      label: 'Portion Math Engine',
      icon: Calculator,
    },
    {
      id: 'timeline-schedule' as ActiveTab,
      label: 'Shopping & Prep Timeline',
      icon: CalendarClock,
    },
  ];

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-zinc-800 text-amber-300' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
