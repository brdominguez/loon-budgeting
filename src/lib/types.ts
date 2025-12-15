// Types for the Loon Budgeting App

export type PaycheckType = 'mid-month' | 'end-of-month';

export type BucketCategory = 
	| 'early-bills'      // Covered by end-of-month paycheck
	| 'late-bills'       // Covered by mid-month paycheck
	| 'groceries'        // Covered by end-of-month paycheck
	| 'savings'          // Covered by end-of-month paycheck
	| 'flexible'         // Covered by mid-month paycheck
	| 'buffer';          // Intentional buffer for variability

export interface Bucket {
        id: string;
        name: string;
        category: BucketCategory;
        targetAmount: number;
        notes?: string;
}

export interface Paycheck {
	id: string;
	type: PaycheckType;
	amount: number;
	date: string; // ISO date string
}

export interface BudgetState {
	buckets: Bucket[];
	paychecks: Paycheck[];
	midMonthPaycheckAmount: number;
	endMonthPaycheckAmount: number;
}
