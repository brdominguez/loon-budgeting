// Utility functions for budget calculations and management
import type { Bucket, BucketCategory, PaycheckType } from './types';

export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

export function getCategoryPaycheck(category: BucketCategory): PaycheckType {
	switch (category) {
		case 'late-bills':
		case 'flexible':
			return 'mid-month';
		case 'early-bills':
		case 'groceries':
		case 'savings':
		case 'buffer':
			return 'end-of-month';
		default:
			// Exhaustive check - if we add a new category, TypeScript will error here
			const _exhaustiveCheck: never = category;
			return _exhaustiveCheck;
	}
}

export function getCategoryLabel(category: BucketCategory): string {
	switch (category) {
		case 'early-bills':
			return 'Early Bills';
		case 'late-bills':
			return 'Late Bills';
		case 'groceries':
			return 'Groceries';
		case 'savings':
			return 'Savings';
		case 'flexible':
			return 'Flexible Spending';
		case 'buffer':
			return 'Buffer';
		default:
			// Exhaustive check - if we add a new category, TypeScript will error here
			const _exhaustiveCheck: never = category;
			return _exhaustiveCheck;
	}
}

export function getBucketsByPaycheck(buckets: Bucket[], paycheckType: PaycheckType): Bucket[] {
	return buckets.filter(bucket => getCategoryPaycheck(bucket.category) === paycheckType);
}

export function calculateTotalAllocated(buckets: Bucket[], paycheckType: PaycheckType): number {
	return getBucketsByPaycheck(buckets, paycheckType)
		.reduce((sum, bucket) => sum + bucket.targetAmount, 0);
}

export function calculateTotalCurrent(buckets: Bucket[], paycheckType: PaycheckType): number {
	return getBucketsByPaycheck(buckets, paycheckType)
		.reduce((sum, bucket) => sum + bucket.currentAmount, 0);
}

export function calculateRemaining(paycheckAmount: number, allocated: number): number {
	return paycheckAmount - allocated;
}

export function getProgressPercentage(current: number, target: number): number {
	if (target === 0) return 0;
	return Math.min((current / target) * 100, 100);
}
