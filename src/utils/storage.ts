import { LifeOSState } from '../types';
import { getInitialState } from './seedData';

const STORAGE_KEY = 'livelife_os_state';

export function loadState(): LifeOSState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      const freshState = getInitialState();
      saveState(freshState);
      return freshState;
    }
    const parsed = JSON.parse(serialized);
    const defaults = getInitialState();
    
    // Merge existing user data with default structures for new fields
    return {
      ...defaults,
      ...parsed,
      language: parsed.language || 'en',
      prayerAlarms: {
        ...defaults.prayerAlarms,
        ...(parsed.prayerAlarms || {})
      },
      customAlarms: parsed.customAlarms || defaults.customAlarms,
      fabSettings: {
        ...defaults.fabSettings!,
        ...(parsed.fabSettings || {})
      },
      debts: parsed.debts || defaults.debts || [],
      loans: parsed.loans || defaults.loans || [],
      customTransactionCategories: parsed.customTransactionCategories || defaults.customTransactionCategories || [],
      customBillCategories: parsed.customBillCategories || defaults.customBillCategories || [],
      categoryBudgets: parsed.categoryBudgets || defaults.categoryBudgets || {}
    };
  } catch (error) {
    console.warn('[Storage] Failed to parse local state, loading seed defaults', error);
    const freshState = getInitialState();
    saveState(freshState);
    return freshState;
  }
}

export function saveState(state: LifeOSState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('[Storage] Error persisting state to localStorage', error);
  }
}
