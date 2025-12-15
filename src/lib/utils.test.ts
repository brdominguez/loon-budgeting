import { describe, expect, it } from 'vitest';
import type { Bucket, BucketCategory, PaycheckType } from './types';
import {
        calculateRemaining,
        calculateTotalAllocated,
        formatCurrency,
        generateId,
        getBucketsByPaycheck,
        getCategoryLabel,
        getCategoryPaycheck
} from './utils';

const buckets: Bucket[] = [
        { id: '1', name: 'Rent', category: 'early-bills', targetAmount: 1200 },
        { id: '2', name: 'Utilities', category: 'late-bills', targetAmount: 300 },
        { id: '3', name: 'Groceries', category: 'groceries', targetAmount: 400 },
        { id: '4', name: 'Savings', category: 'savings', targetAmount: 500 },
        { id: '5', name: 'Fun', category: 'flexible', targetAmount: 250 }
];

const paycheckLabels: Record<BucketCategory, PaycheckType> = {
        'early-bills': 'end-of-month',
        'late-bills': 'mid-month',
        groceries: 'end-of-month',
        savings: 'end-of-month',
        flexible: 'mid-month',
        buffer: 'end-of-month'
};

describe('generateId', () => {
        it('creates unique, timestamp-based ids', () => {
                const first = generateId();
                const second = generateId();

                expect(first).not.toBe(second);
                expect(first).toMatch(/^\d+-[a-z0-9]{7}$/);
        });
});

describe('formatCurrency', () => {
        it('formats numbers as USD currency', () => {
                expect(formatCurrency(1234.5)).toBe('$1,234.50');
                expect(formatCurrency(0)).toBe('$0.00');
        });
});

describe('category helpers', () => {
        it('maps categories to paycheck types', () => {
                (Object.keys(paycheckLabels) as BucketCategory[]).forEach(category => {
                        expect(getCategoryPaycheck(category)).toBe(paycheckLabels[category]);
                });
        });

        it('returns display labels for categories', () => {
                const expectedLabels: Record<BucketCategory, string> = {
                        'early-bills': 'Early Bills',
                        'late-bills': 'Late Bills',
                        groceries: 'Groceries',
                        savings: 'Savings',
                        flexible: 'Flexible Spending',
                        buffer: 'Buffer'
                };

                (Object.keys(expectedLabels) as BucketCategory[]).forEach(category => {
                        expect(getCategoryLabel(category)).toBe(expectedLabels[category]);
                });
        });
});

describe('bucket calculations', () => {
        it('filters buckets by paycheck type', () => {
                expect(getBucketsByPaycheck(buckets, 'mid-month')).toHaveLength(2);
                expect(getBucketsByPaycheck(buckets, 'end-of-month')).toHaveLength(3);
        });

        it('calculates allocated totals per paycheck', () => {
                expect(calculateTotalAllocated(buckets, 'mid-month')).toBe(550);
                expect(calculateTotalAllocated(buckets, 'end-of-month')).toBe(2100);
        });
});

describe('budget math utilities', () => {
        it('calculates remaining funds', () => {
                expect(calculateRemaining(1500, 900)).toBe(600);
        });
});
