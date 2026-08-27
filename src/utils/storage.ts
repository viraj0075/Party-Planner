import { PartyPlan } from '../types';
import { PARTY_PRESETS } from '../data/presets';

const STORAGE_KEY_PLANS = 'party_planner_plans_v1';
const STORAGE_KEY_ACTIVE = 'party_planner_active_id_v1';

export function loadSavedPlans(): PartyPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading plans from storage:', e);
  }
  return [];
}

export function savePlansToStorage(plans: PartyPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving plans to storage:', e);
  }
}

export function loadActivePlanId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE);
  } catch (e) {
    return null;
  }
}

export function saveActivePlanId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  } catch (e) {
    // ignore
  }
}
