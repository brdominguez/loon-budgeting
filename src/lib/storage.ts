// Local storage utilities for persisting budget state
import type { BudgetState } from './types';

const STORAGE_KEY = 'loon-budget-state';

export function loadBudgetState(): BudgetState | null {
	if (typeof window === 'undefined') return null;
	
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error('Error loading budget state:', error);
	}
	
	return null;
}

export function saveBudgetState(state: BudgetState): void {
	if (typeof window === 'undefined') return;
	
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.error('Error saving budget state:', error);
	}
}

export function clearBudgetState(): void {
	if (typeof window === 'undefined') return;
	
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error('Error clearing budget state:', error);
	}
}
