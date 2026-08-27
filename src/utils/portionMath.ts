export interface PortionRule {
  category: string;
  name: string;
  unit: string;
  calculate: (guests: number, adults: number, kids: number, hours: number, mealType: string) => {
    amount: number;
    unit: string;
    displayText: string;
    explanation: string;
  };
}

export const PORTION_RULES: PortionRule[] = [
  {
    category: 'Beverages',
    name: 'Alcoholic Drinks (Beer, Wine, Spirits)',
    unit: 'drinks',
    calculate: (guests, adults, kids, hours) => {
      // Standard rule: 2 drinks first hour, 1 drink each subsequent hour per adult
      const totalDrinks = adults * (2 + Math.max(0, hours - 1));
      const wineBottles = Math.ceil((totalDrinks * 0.4) / 5); // 40% wine (5 glasses/bottle)
      const beerCans = Math.ceil(totalDrinks * 0.4); // 40% beer
      const liquorDrinks = Math.ceil(totalDrinks * 0.2); // 20% spirits

      return {
        amount: totalDrinks,
        unit: 'total drinks',
        displayText: `${totalDrinks} drinks (~${wineBottles} wine bottles, ${beerCans} beers, ${liquorDrinks} cocktail servings)`,
        explanation: `${adults} adults × (2 drinks 1st hour + 1 drink/hr × ${Math.max(0, hours - 1)} hrs)`,
      };
    },
  },
  {
    category: 'Beverages',
    name: 'Non-Alcoholic Drinks (Water, Soda, Juice)',
    unit: 'servings',
    calculate: (guests, adults, kids, hours) => {
      const perPerson = 1 + hours * 0.5;
      const total = Math.ceil(guests * perPerson);
      return {
        amount: total,
        unit: 'servings',
        displayText: `${total} servings (~${Math.ceil(total / 8)} 2L bottles or ${total} cans)`,
        explanation: `~1-2 non-alcoholic beverages per guest for hydration alongside drinks`,
      };
    },
  },
  {
    category: 'Chilling',
    name: 'Ice (Drink Chilling & Service)',
    unit: 'lbs',
    calculate: (guests, adults, kids, hours) => {
      const lbs = Math.ceil(guests * 1.5);
      const tenLbBags = Math.ceil(lbs / 10);
      return {
        amount: lbs,
        unit: 'lbs',
        displayText: `${lbs} lbs (${tenLbBags} × 10lb bags)`,
        explanation: '1 lb per person for coolers + 0.5 lb per person for cups',
      };
    },
  },
  {
    category: 'Food',
    name: 'Appetizers & Finger Foods',
    unit: 'pieces',
    calculate: (guests, adults, kids, hours, mealType) => {
      let multiplier = 6;
      if (mealType === 'appetizers_cocktails') multiplier = 8 + Math.max(0, hours - 2) * 2;
      else if (mealType === 'full_meal') multiplier = 3;
      else if (mealType === 'snacks_drinks') multiplier = 5;

      const pieces = Math.ceil(guests * multiplier);
      return {
        amount: pieces,
        unit: 'pieces',
        displayText: `${pieces} bite-sized pieces (${multiplier} per guest)`,
        explanation:
          mealType === 'appetizers_cocktails'
            ? 'For cocktail parties without dinner, plan 8-12 hearty pieces per person'
            : 'For dinner parties, 3-4 light appetizers before the main course',
      };
    },
  },
  {
    category: 'Food',
    name: 'Main Course Proteins (Meat, Fish, Poultry)',
    unit: 'lbs',
    calculate: (guests, adults, kids, hours, mealType) => {
      if (mealType === 'snacks_drinks' || mealType === 'dessert_coffee') {
        return {
          amount: 0,
          unit: 'lbs',
          displayText: 'N/A (Light refreshments only)',
          explanation: 'Not required for snacks or dessert parties',
        };
      }
      const rawLbs = guests * (mealType === 'bbq_cookout' ? 0.6 : 0.45);
      const rounded = Math.ceil(rawLbs * 10) / 10;
      return {
        amount: rounded,
        unit: 'lbs (raw weight)',
        displayText: `${rounded} lbs raw protein`,
        explanation:
          mealType === 'bbq_cookout'
            ? '0.6 lb raw meat per person (cooks down ~25%)'
            : '0.45 lb raw meat/protein per person for standard dinner',
      };
    },
  },
  {
    category: 'Food',
    name: 'Side Dishes & Salads',
    unit: 'servings',
    calculate: (guests) => {
      const servings = Math.ceil(guests * 1.25);
      return {
        amount: servings,
        unit: 'servings',
        displayText: `${servings} side servings (~${Math.ceil(servings / 4)} medium bowls)`,
        explanation: 'Plan 1.25 side servings per person across 2-3 different side dish options',
      };
    },
  },
  {
    category: 'Dessert',
    name: 'Dessert & Sweets',
    unit: 'portions',
    calculate: (guests) => {
      const count = Math.ceil(guests * 1.2);
      return {
        amount: count,
        unit: 'servings',
        displayText: `${count} dessert portions (e.g. ${Math.ceil(count / 12)} dozen cupcakes/cookies or 1 large cake)`,
        explanation: '1.2 servings per guest to account for multiple dessert choices and second helpings',
      };
    },
  },
  {
    category: 'Tableware',
    name: 'Plates, Cups & Cutlery',
    unit: 'sets',
    calculate: (guests, adults, kids, hours) => {
      const plates = Math.ceil(guests * 2.5);
      const cups = Math.ceil(guests * 2.5);
      const napkins = Math.ceil(guests * 3.5);
      return {
        amount: plates,
        unit: 'items',
        displayText: `${plates} plates, ${cups} cups, ${napkins} napkins`,
        explanation: 'Guests typically use 2 plates (appetizers + main/dessert) and 2-3 cups during an event',
      };
    },
  },
];
