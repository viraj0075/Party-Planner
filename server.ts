import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini Completion Helper using @google/genai with automatic retry and model fallback
async function generateCompletion(prompt: string, systemInstruction: string, jsonSchemaStr?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.5-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const content = response.text;
        if (!content) {
          throw new Error('Empty response from Gemini model');
        }
        return content;
      } catch (err: any) {
        lastError = err;
        const is503 = err.status === 503 || (err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE')));
        if (is503 && attempt < 2) {
          console.warn(`Gemini 503 received for model ${modelName}, retrying attempt ${attempt + 1}/2 after delay...`);
          await new Promise(resolve => setTimeout(resolve, 800 * attempt));
          continue;
        }
        if (is503 && modelsToTry.indexOf(modelName) < modelsToTry.length - 1) {
          console.warn(`Gemini model ${modelName} failed with 503, falling back to next model...`);
          break;
        }
        throw err;
      }
    }
  }
  throw lastError;
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: 'ok', hasGeminiKey: hasKey });
});

// Generate Comprehensive Party Plan & Shopping List
app.post('/api/plan-party', async (req: Request, res: Response) => {
  try {
    const details = req.body;
    const {
      title,
      eventType,
      theme,
      guestCount = 15,
      adultCount = 15,
      kidCount = 0,
      durationHours = 3,
      budget = 300,
      mealType = 'appetizers_cocktails',
      venueType = 'indoor_home',
      dietaryRestrictions = [],
      vibeDescription = '',
      customRequests = '',
    } = details;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback generator when key is not present
      return res.json(generateFallbackPlan(details));
    }

    const schemaStr = `{
  "items": [
    {
      "name": "string",
      "category": "food | drinks | decor | entertainment | supplies",
      "quantity": number,
      "unit": "string (e.g. bottles, lbs, packs, boxes, bags, units)",
      "estimatedCost": number (in USD),
      "store": "string",
      "notes": "string",
      "priority": "must-have | nice-to-have | backup",
      "portionBasis": "string (e.g. 2 per person for 20 guests)",
      "suggestedAlternative": {
        "name": "string",
        "costDiff": number (Negative number for savings, e.g. -12),
        "reason": "string"
      }
    }
  ],
  "portionMetrics": [
    {
      "category": "string",
      "item": "string",
      "calculation": "string",
      "ruleExplanation": "string",
      "recommendedAmount": "string"
    }
  ],
  "timeline": [
    {
      "timeframe": "2_weeks_prior | 1_week_prior | 2_days_prior | 1_day_prior | day_of_morning",
      "timeframeLabel": "string (e.g. 2 Weeks Before, 1 Day Before)",
      "title": "string",
      "description": "string",
      "tasks": [
        {
          "text": "string"
        }
      ]
    }
  ],
  "budgetOptimization": {
    "overallAnalysis": "string",
    "savingsTips": [
      {
        "title": "string",
        "potentialSavings": number,
        "action": "string"
      }
    ],
    "splurgeRecommendations": [
      {
        "title": "string",
        "extraCost": number,
        "impact": "string"
      }
    ]
  },
  "signatureRecipe": {
    "title": "string",
    "description": "string",
    "type": "cocktail | mocktail | punch | dish | snack",
    "servings": number,
    "ingredients": [
      {
        "name": "string",
        "amount": "string",
        "estimatedCost": number
      }
    ],
    "instructions": [
      "string"
    ],
    "tips": "string"
  }
}`;

    const prompt = `You are the CymbalMart Party Planning & Smart Shopping Agent.
Create a comprehensive, realistic, and budget-conscious party shopping plan, aisle routing, and timeline for the following party details:
- Event Title: ${title || 'Party'}
- Event Type: ${eventType}
- Theme & Vibe: ${theme} (${vibeDescription || 'Fun and festive'})
- Guests: Total ${guestCount} (${adultCount} adults, ${kidCount} kids/teens)
- Event Duration: ${durationHours} hours
- Target Budget: $${budget}
- Meal/Refreshment Type: ${mealType} (e.g., full meal, appetizers & cocktails, BBQ cookout, snacks, dessert)
- Venue: ${venueType}
- Dietary Needs: ${dietaryRestrictions.join(', ') || 'None specified'}
- Custom Requests/Notes: ${customRequests || 'None'}

Make sure your calculations follow real party hosting math and CymbalMart department routing:
1. Drinks: ~2 drinks per adult in the 1st hour, 1 drink/hour after. Water/soda for all. Ice: ~1.5 lbs per person.
2. Food: 5-8 appetizers/person for cocktail parties, or proper protein (0.5 lb/person) for cookouts/meals.
3. Quantities, Units, and Realistic Estimated Prices ($ USD).
4. Categorize each item into one of: "food", "drinks", "decor", "entertainment", "supplies".
5. Assign best store/aisle for each item: "CymbalMart Supercenter", "CymbalMart Deli & Bakery", "CymbalMart Beverage Depot", "CymbalMart Fresh Produce", "CymbalMart Party & Decor", "CymbalMart Bulk Aisle", "Specialty Liquor / Wine", "Local Florist / Bakery".
6. Priority: "must-have", "nice-to-have", or "backup".
7. Include portion reasoning for major food/beverage items.
8. Include a signature themed cocktail/mocktail/punch recipe with exact proportions for ${guestCount} guests.
9. Provide 4-6 time-phased prep & shopping steps ("2_weeks_prior", "1_week_prior", "2_days_prior", "1_day_prior", "day_of_morning").
10. Provide budget optimization analysis with 2-3 specific savings tips and 1-2 splurge ideas.

You MUST respond with valid JSON that matches the following JSON schema:
${schemaStr}`;

    const text = await generateCompletion(
      prompt,
      'You are a professional party planner and smart shopping master. Always respond with strict, well-structured JSON adhering to the specified schema.',
      schemaStr
    );

    const parsed = JSON.parse(cleanJsonString(text));

    // Normalize IDs and checked states
    const itemsWithIds = (parsed.items || []).map((it: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      name: it.name || 'Item',
      category: validateCategory(it.category),
      quantity: Number(it.quantity) || 1,
      unit: it.unit || 'unit',
      estimatedCost: Number(it.estimatedCost) || 5,
      checked: false,
      store: validateStore(it.store),
      notes: it.notes || '',
      priority: it.priority === 'nice-to-have' || it.priority === 'backup' ? it.priority : 'must-have',
      portionBasis: it.portionBasis || '',
      suggestedAlternative: it.suggestedAlternative || undefined,
    }));

    const timelineWithIds = (parsed.timeline || []).map((tl: any, idx: number) => ({
      id: `tl-${Date.now()}-${idx}`,
      timeframe: tl.timeframe || '1_week_prior',
      timeframeLabel: tl.timeframeLabel || 'Planning Step',
      title: tl.title || 'Task',
      description: tl.description || '',
      tasks: (tl.tasks || []).map((t: any, tIdx: number) => ({
        id: `task-${idx}-${tIdx}`,
        text: typeof t === 'string' ? t : t.text || 'Task',
        completed: false,
      })),
    }));

    const portionMetricsWithIds = (parsed.portionMetrics || []).map((pm: any, idx: number) => ({
      id: `pm-${Date.now()}-${idx}`,
      category: pm.category || 'Food & Drink',
      item: pm.item || 'Portion',
      calculation: pm.calculation || '',
      ruleExplanation: pm.ruleExplanation || '',
      recommendedAmount: pm.recommendedAmount || '',
    }));

    const plan = {
      details: {
        ...details,
        id: details.id || `party-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      items: itemsWithIds,
      portionMetrics: portionMetricsWithIds,
      timeline: timelineWithIds,
      budgetOptimization: parsed.budgetOptimization,
      signatureRecipe: parsed.signatureRecipe,
    };

    res.json(plan);
  } catch (error: any) {
    console.error('Error generating party plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate party plan' });
  }
});

// Conversational CymbalMart Assistant Chatbot for Customers
app.post('/api/agent-chat', async (req: Request, res: Response) => {
  try {
    const { message, partyPlan, history = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        content: `Hi there! I'm your CymbalMart Assistant. Since we're running in offline mode, you can freely browse our aisles, customize your party checklist, adjust portion quantities, and track your budget right on screen. How can I help you prepare today?`,
      });
    }

    // Format previous chat history for multi-turn context
    const historyText = Array.isArray(history) && history.length > 0
      ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Customer' : 'CymbalMart Assistant'}: ${h.content}`).join('\n')
      : 'No prior messages.';

    const prompt = `You are "CymbalMart Assistant", the friendly, knowledgeable, and customer-focused AI shopping & party planning chatbot for CymbalMart customers.

CymbalMart Store Departments:
- CymbalMart Fresh Produce (fruits, salad kits, garnishes, dips, veggie trays)
- CymbalMart Deli & Bakery (charcuterie boards, artisan bread, slider buns, dips, custom cakes)
- CymbalMart Beverage Depot (sodas, sparkling waters, craft beers, wine, cocktail mixers, ice)
- CymbalMart Bulk Aisle (large-pack chips, burger patties, snack tubs, nuts)
- CymbalMart Party & Decor (balloons, banners, biodegradable plates, cups, cutlery, napkins)
- CymbalMart Supercenter (general grocery, condiments, pantry essentials, cleanup supplies)

Current Customer Party Plan:
- Event Title: ${partyPlan?.details?.title || 'Party'}
- Event Type: ${partyPlan?.details?.eventType || 'Celebration'}
- Theme: ${partyPlan?.details?.theme || 'Standard'}
- Guests: ${partyPlan?.details?.guestCount || 15} (${partyPlan?.details?.adultCount || 15} adults, ${partyPlan?.details?.kidCount || 0} kids)
- Budget: $${partyPlan?.details?.budget || 300}
- Current Items in Cart/List (${partyPlan?.items?.length || 0} items): ${(partyPlan?.items || []).slice(0, 20).map((it: any) => it.name).join(', ')}
- Total Estimated Cost: $${(partyPlan?.items || []).reduce((acc: number, it: any) => acc + (it.estimatedCost || 0), 0).toFixed(2)}

Recent Conversation History:
${historyText}

Customer's new message: "${message}"

Your Goal:
Provide a cheerful, practical, and helpful response as the CymbalMart Assistant.
- Help customers calculate portion sizes (drinks, proteins, ice, appetizers).
- Recommend budget-saving alternatives or bulk savings at CymbalMart.
- Suggest dietary accommodations (gluten-free, vegan, nut-free, kid-friendly).
- Answer questions about ingredients, recipes, prep timelines, and store aisles.
- When the customer asks for item recommendations or list changes, include them in the "actionPayload" so they can click one button to add them directly to their shopping list.

Return a valid JSON object matching this schema:
{
  "content": "Warm, engaging, and clear advice directly addressing the customer's question.",
  "actionPayload": {
    "type": "add_items" (or "adjust_budget" or "apply_dietary" or "update_quantities" or "none"),
    "items": [
      {
        "name": "Item name",
        "category": "food" | "drinks" | "decor" | "entertainment" | "supplies",
        "quantity": 2,
        "unit": "packs",
        "estimatedCost": 8.99,
        "store": "CymbalMart Deli & Bakery",
        "priority": "must-have",
        "notes": "Crispy gluten-free crackers"
      }
    ],
    "budget": 250 (optional if customer asked to change budget),
    "message": "Summary of suggested items"
  }
}`;

    const text = await generateCompletion(
      prompt,
      'You are "CymbalMart Assistant", the premier customer chatbot for CymbalMart retail and party shopping. Always maintain a polite, resourceful, and helpful customer service tone. Return valid JSON.',
      ''
    );

    const parsed = JSON.parse(cleanJsonString(text || '{}'));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in CymbalMart assistant chat:', error);
    res.status(500).json({
      content: "I'm sorry, I encountered a brief hiccup while processing your request. Please ask again or browse our aisles directly in your list!",
    });
  }
});

// Custom Signature Recipe Generator
app.post('/api/suggest-recipe', async (req: Request, res: Response) => {
  try {
    const { partyDetails, recipeType = 'cocktail' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        title: `${partyDetails?.theme || 'Fiesta'} Signature Punch`,
        description: 'A crowd-pleasing, vibrant punch that is easy to make in bulk ahead of time.',
        type: recipeType,
        servings: partyDetails?.guestCount || 15,
        ingredients: [
          { name: 'Sparkling Apple Cider / Prosecco', amount: '3 bottles', estimatedCost: 18 },
          { name: 'Pomegranate & Cranberry Juice', amount: '2 liters', estimatedCost: 8 },
          { name: 'Ginger Beer', amount: '4 cans', estimatedCost: 6 },
          { name: 'Fresh Rosemary & Orange Slices', amount: '1 pack', estimatedCost: 4 },
        ],
        instructions: [
          'Chill all liquid ingredients for at least 4 hours before party time.',
          'In a large punch bowl or beverage dispenser with ice ring, combine juice and ginger beer.',
          'Gently pour in chilled prosecco or cider right before guests arrive.',
          'Float orange wheels and fresh rosemary sprigs for a festive look.',
        ],
        tips: 'Keep an extra batch pre-mixed without carbonation in the fridge for rapid refills!',
      });
    }

    const prompt = `Create an incredible signature ${recipeType} recipe perfectly styled for this party:
- Theme: ${partyDetails?.theme || 'Celebration'}
- Event Type: ${partyDetails?.eventType || 'Party'}
- Guests: ${partyDetails?.guestCount || 15}
- Vibe: ${partyDetails?.vibeDescription || 'Lively and celebratory'}
- Dietary: ${(partyDetails?.dietaryRestrictions || []).join(', ') || 'Standard'}

Return JSON:
{
  "title": "Creative Drink or Dish Name",
  "description": "Short appetizing description",
  "type": "${recipeType}",
  "servings": ${partyDetails?.guestCount || 15},
  "ingredients": [
    {"name": "Ingredient name", "amount": "quantity + unit", "estimatedCost": 8.00}
  ],
  "instructions": [
    "Step 1", "Step 2", "Step 3"
  ],
  "tips": "Pro prep tip for the host"
}`;

    const text = await generateCompletion(
      prompt,
      'You are a professional recipe generator. Return valid JSON.',
      ''
    );

    const parsed = JSON.parse(cleanJsonString(text || '{}'));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error suggesting recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// Helper Validators & Fallbacks
function validateCategory(cat: string): any {
  const valid = ['food', 'drinks', 'decor', 'entertainment', 'supplies'];
  const lower = (cat || '').toLowerCase();
  return valid.includes(lower) ? lower : 'food';
}

function validateStore(store: string): any {
  const list = [
    'CymbalMart Supercenter',
    'CymbalMart Deli & Bakery',
    'CymbalMart Beverage Depot',
    'CymbalMart Fresh Produce',
    'CymbalMart Party & Decor',
    'CymbalMart Bulk Aisle',
    'Costco / Wholesale',
    "Trader Joe's",
    'Supermarket / Grocery',
    'Target / Retail',
    'Party City / Amazon',
    'Liquor Store',
    'Local Bakery / Deli',
  ];
  const found = list.find((s) => s.toLowerCase().includes((store || '').toLowerCase()));
  return found || 'CymbalMart Supercenter';
}

function generateFallbackPlan(details: any) {
  const guests = Number(details.guestCount) || 16;
  const adults = Number(details.adultCount) || 16;
  const budget = Number(details.budget) || 280;
  const theme = details.theme || 'Festive Celebration';

  return {
    details: {
      ...details,
      id: details.id || `party-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    items: [
      {
        id: `item-1`,
        name: 'Artisan Cheese & Charcuterie Platter',
        category: 'food',
        quantity: 2,
        unit: 'large boards/trays',
        estimatedCost: 45,
        checked: false,
        store: 'CymbalMart Deli & Bakery',
        priority: 'must-have',
        notes: 'Includes brie, aged cheddar, prosciutto, crackers, and fig jam',
        portionBasis: '2-3 oz cheese/cured meats per guest',
      },
      {
        id: `item-2`,
        name: 'Gourmet Slider Buns & Pulled Meat',
        category: 'food',
        quantity: Math.ceil(guests * 1.5),
        unit: 'sliders',
        estimatedCost: 40,
        checked: false,
        store: 'CymbalMart Bulk Aisle',
        priority: 'must-have',
        notes: 'Easy crowd-pleaser warm hearty bite',
        portionBasis: '1.5-2 sliders per person',
      },
      {
        id: `item-3`,
        name: 'Fresh Crisp Veggie Crudité & Herb Dip',
        category: 'food',
        quantity: 2,
        unit: 'large platters',
        estimatedCost: 18,
        checked: false,
        store: 'CymbalMart Fresh Produce',
        priority: 'must-have',
        notes: 'Baby carrots, cucumbers, bell peppers, tzatziki & ranch',
      },
      {
        id: `item-4`,
        name: 'Craft Beer Assortment & Hard Seltzers',
        category: 'drinks',
        quantity: Math.ceil(adults * 2.5),
        unit: 'cans/bottles',
        estimatedCost: 48,
        checked: false,
        store: 'CymbalMart Beverage Depot',
        priority: 'must-have',
        portionBasis: '2-3 drinks per adult host standard',
      },
      {
        id: `item-5`,
        name: 'Prosecco & Crisp White Wine',
        category: 'drinks',
        quantity: Math.ceil(adults / 3.5),
        unit: '750ml bottles',
        estimatedCost: 36,
        checked: false,
        store: 'CymbalMart Beverage Depot',
        priority: 'must-have',
        notes: 'For welcome toasts and pairing',
      },
      {
        id: `item-6`,
        name: 'Sparkling Flavored Waters & Sodas',
        category: 'drinks',
        quantity: 24,
        unit: 'cans',
        estimatedCost: 16,
        checked: false,
        store: 'CymbalMart Beverage Depot',
        priority: 'must-have',
      },
      {
        id: `item-7`,
        name: 'Party Ice Bags (Clean cube)',
        category: 'drinks',
        quantity: Math.ceil((guests * 1.5) / 10),
        unit: '10lb bags',
        estimatedCost: 12,
        checked: false,
        store: 'CymbalMart Supercenter',
        priority: 'must-have',
        portionBasis: '1.5 lbs of ice per guest',
      },
      {
        id: `item-8`,
        name: 'Themed Dinner Plates & Heavy Napkins',
        category: 'supplies',
        quantity: Math.ceil(guests * 2),
        unit: 'count pack',
        estimatedCost: 14,
        checked: false,
        store: 'CymbalMart Party & Decor',
        priority: 'must-have',
        portionBasis: '2 plates and 3 napkins per guest',
      },
      {
        id: `item-9`,
        name: 'Balloons & Color Banner Garland',
        category: 'decor',
        quantity: 1,
        unit: 'kit',
        estimatedCost: 18,
        checked: false,
        store: 'CymbalMart Party & Decor',
        priority: 'nice-to-have',
        notes: `Matches ${theme} color palette`,
      },
      {
        id: `item-10`,
        name: 'Heavy Duty Trash & Recycling Bags',
        category: 'supplies',
        quantity: 1,
        unit: 'box',
        estimatedCost: 8,
        checked: false,
        store: 'CymbalMart Supercenter',
        priority: 'must-have',
      },
    ],
    portionMetrics: [
      {
        id: 'pm-1',
        category: 'Appetizers & Food',
        item: 'Savory Bites',
        calculation: `${guests} guests × 6 portions`,
        ruleExplanation: 'For 3-hour evening parties, plan 5-7 bite-sized portions per person.',
        recommendedAmount: `${guests * 6} total savory pieces`,
      },
      {
        id: 'pm-2',
        category: 'Bar & Beverages',
        item: 'Alcoholic Drinks',
        calculation: `${adults} adults × 3.5 drinks avg`,
        ruleExplanation: 'Host rule: 2 drinks per guest in first hour, plus 1 drink per hour after.',
        recommendedAmount: `~${Math.round(adults * 3.5)} drinks total (beer, wine, spirits)`,
      },
      {
        id: 'pm-3',
        category: 'Ice & Chilling',
        item: 'Cubed Ice',
        calculation: `${guests} guests × 1.5 lbs`,
        ruleExplanation: '1 lb per person for chilling drinks, 0.5 lb per person for serving in glasses.',
        recommendedAmount: `${Math.round(guests * 1.5)} lbs ice`,
      },
    ],
    timeline: [
      {
        id: 'tl-1',
        timeframe: '1_week_prior',
        timeframeLabel: '1 Week Before',
        title: 'Inventory, Decor & Wholesale Run',
        description: 'Get all non-perishables, tableware, and wholesale drink packages.',
        tasks: [
          { id: 't-1', text: 'Confirm final RSVP guest count', completed: false },
          { id: 't-2', text: 'Order specialty decor, banners, and tableware kit', completed: false },
          { id: 't-3', text: 'Buy canned sodas, seltzers, dry snacks, and paper supplies at Costco/Target', completed: false },
        ],
      },
      {
        id: 'tl-2',
        timeframe: '2_days_prior',
        timeframeLabel: '2 Days Before',
        title: 'Beverage & Pre-Prep Grocery Trip',
        description: 'Purchase wine, beer, hard cheeses, cured meats, and sauces.',
        tasks: [
          { id: 't-4', text: 'Pick up wines, beer, and mixers from Trader Joes / Liquor Store', completed: false },
          { id: 't-5', text: 'Make or curate Spotify party playlist', completed: false },
          { id: 't-6', text: 'Deep clean party zone & set up bar station surface', completed: false },
        ],
      },
      {
        id: 'tl-3',
        timeframe: 'day_of_morning',
        timeframeLabel: 'Day of Party (Morning)',
        title: 'Fresh Produce, Ice & Final Staging',
        description: 'Grab fresh items, ice, and chill beverages.',
        tasks: [
          { id: 't-7', text: 'Buy bags of ice and fresh bakery breads/garnishes', completed: false },
          { id: 't-8', text: 'Fill coolers and ice buckets with drinks 3 hours before start', completed: false },
          { id: 't-9', text: 'Assemble charcuterie boards and light ambiance candles/lamps', completed: false },
        ],
      },
    ],
    budgetOptimization: {
      overallAnalysis: `Your plan comes out to ~$237 out of your $${budget} budget, leaving a healthy safety buffer!`,
      savingsTips: [
        {
          title: 'Batch Signature Punch vs. Full Open Bar',
          potentialSavings: 35,
          action: 'Make one large bowl of themed punch instead of buying 4 different spirit bottles.',
        },
        {
          title: 'Buy Cheese Blocks & Slice at Home',
          potentialSavings: 15,
          action: 'Pre-sliced gourmet cheese trays cost 2x more than slicing blocks from wholesale clubs.',
        },
      ],
      splurgeRecommendations: [
        {
          title: 'Custom Balloon Garland Arch',
          extraCost: 25,
          impact: 'Creates an immediate high-impact photo backdrop as guests enter.',
        },
      ],
    },
    signatureRecipe: {
      title: `${theme} Sunset Sangria Bowl`,
      description: 'Refreshing, easy batch cocktail that looks festive and tastes incredible.',
      type: 'cocktail',
      servings: guests,
      ingredients: [
        { name: 'Spanish Garnacha / Pinot Noir', amount: '2 bottles', estimatedCost: 18 },
        { name: 'Brandy / Triple Sec', amount: '1 cup', estimatedCost: 10 },
        { name: 'Fresh Orange & Pomegranate Juice', amount: '3 cups', estimatedCost: 6 },
        { name: 'Sliced Apples, Oranges & Berries', amount: '2 cups', estimatedCost: 5 },
        { name: 'Club Soda / Ginger Ale to top', amount: '1 bottle', estimatedCost: 3 },
      ],
      instructions: [
        'Slice fruits and add to large pitcher or beverage dispenser with brandy and wine.',
        'Macerate in refrigerator for 4-12 hours for deep flavor infusion.',
        'Right before serving, add ice and top with chilled club soda or ginger ale.',
      ],
      tips: 'Have a pitcher of sparkling apple juice with the same fruit garnish for non-drinkers!',
    },
  };
}

export default app;

// Vite Server Integration
if (!process.env.VERCEL) {
  const startServer = async () => {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Party Planner Shopping Agent server running on http://localhost:${PORT}`);
    });
  };

  startServer();
}
