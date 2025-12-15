<script lang="ts">
        import { onMount } from 'svelte';
        import type { Bucket, BucketCategory, BudgetState } from '$lib/types';
        import { loadBudgetState, saveBudgetState } from '$lib/storage';
	import {
		generateId,
		formatCurrency,
		getCategoryLabel,
		getCategoryPaycheck,
		getBucketsByPaycheck,
		calculateTotalAllocated,
		calculateRemaining,
		getProgressPercentage
	} from '$lib/utils';

        let state: BudgetState = {
                buckets: [],
                paychecks: [],
                midMonthPaycheckAmount: 0,
                endMonthPaycheckAmount: 0
        };

        let showAddBucket = false;
        let editingBucket: Bucket | null = null;

        // Form state for new/edit bucket
        let formName = '';
        let formCategory: BucketCategory = 'flexible';
        let formTargetAmount = 0;
        let formCurrentAmount = 0;
        let formNotes = '';

	onMount(() => {
		const loaded = loadBudgetState();
		if (loaded) {
			state = loaded;
		}
	});

        // Reactive calculations
        let midMonthAllocated = 0;
        let endMonthAllocated = 0;
        let midMonthRemaining = 0;
        let endMonthRemaining = 0;

        $: midMonthAllocated = calculateTotalAllocated(state.buckets, 'mid-month');
        $: endMonthAllocated = calculateTotalAllocated(state.buckets, 'end-of-month');
        $: midMonthRemaining = calculateRemaining(state.midMonthPaycheckAmount, midMonthAllocated);
        $: endMonthRemaining = calculateRemaining(state.endMonthPaycheckAmount, endMonthAllocated);

	function saveState() {
		saveBudgetState(state);
	}

	function updatePaycheckAmount(type: 'mid-month' | 'end-of-month', amount: number) {
		if (type === 'mid-month') {
			state.midMonthPaycheckAmount = amount;
		} else {
			state.endMonthPaycheckAmount = amount;
		}
		saveState();
	}

	function openAddBucket() {
		editingBucket = null;
		formName = '';
		formCategory = 'flexible';
		formTargetAmount = 0;
		formCurrentAmount = 0;
		formNotes = '';
		showAddBucket = true;
	}

	function openEditBucket(bucket: Bucket) {
		editingBucket = bucket;
		formName = bucket.name;
		formCategory = bucket.category;
		formTargetAmount = bucket.targetAmount;
		formCurrentAmount = bucket.currentAmount;
		formNotes = bucket.notes || '';
		showAddBucket = true;
	}

        function closeForm() {
                showAddBucket = false;
                editingBucket = null;
        }

        function handleOverlayKeydown(event: KeyboardEvent) {
                if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        closeForm();
                } else if (event.key === 'Escape') {
                        closeForm();
                }
        }

	function saveBucket() {
		if (!formName.trim()) return;

        if (editingBucket) {
                        const bucketToUpdate = editingBucket;

                        // Update existing bucket
                        const index = state.buckets.findIndex((b: Bucket) => b.id === bucketToUpdate.id);
                        if (index !== -1) {
                                state.buckets[index] = {
                                        ...bucketToUpdate,
                                        name: formName.trim(),
                                        category: formCategory,
                                        targetAmount: formTargetAmount,
					currentAmount: formCurrentAmount,
					notes: formNotes.trim() || undefined
				};
			}
		} else {
			// Add new bucket
			const newBucket: Bucket = {
				id: generateId(),
				name: formName.trim(),
				category: formCategory,
				targetAmount: formTargetAmount,
				currentAmount: formCurrentAmount,
				notes: formNotes.trim() || undefined
			};
			state.buckets = [...state.buckets, newBucket];
		}

		saveState();
		closeForm();
	}

	function deleteBucket(bucketId: string) {
		if (confirm('Are you sure you want to delete this bucket?')) {
                        state.buckets = state.buckets.filter((b: Bucket) => b.id !== bucketId);
			saveState();
		}
	}

	function updateBucketAmount(bucketId: string, amount: number) {
                const index = state.buckets.findIndex((b: Bucket) => b.id === bucketId);
		if (index !== -1) {
			state.buckets[index].currentAmount = amount;
			saveState();
		}
	}

	const categories: BucketCategory[] = [
		'early-bills',
		'late-bills',
		'groceries',
		'savings',
		'flexible',
		'buffer'
	];
</script>

<main>
	<header>
		<h1>🦆 Loon Budgeting</h1>
		<p>Paycheck-Segmented Bucket System</p>
	</header>

	<div class="container">
		<!-- Paycheck Configuration -->
		<section class="paycheck-config">
			<h2>💰 Paycheck Amounts</h2>
			<div class="paycheck-inputs">
                                <div class="paycheck-input">
                                        <label for="mid-month-paycheck">
                                                <strong>Mid-Month Paycheck</strong>
                                                <span class="hint">Covers: Late Bills + Flexible Spending</span>
                                        </label>
                                        <div class="input-group">
                                                <span class="currency-symbol">$</span>
                                                <input
                                                        id="mid-month-paycheck"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={state.midMonthPaycheckAmount}
                                                        oninput={(e) => updatePaycheckAmount('mid-month', parseFloat(e.currentTarget.value) || 0)}
                                                />
                                        </div>
                                </div>
                                <div class="paycheck-input">
                                        <label for="end-month-paycheck">
                                                <strong>End-of-Month Paycheck</strong>
                                                <span class="hint">Covers: Early Bills + Groceries + Savings + Buffer</span>
                                        </label>
                                        <div class="input-group">
                                                <span class="currency-symbol">$</span>
                                                <input
                                                        id="end-month-paycheck"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={state.endMonthPaycheckAmount}
							oninput={(e) => updatePaycheckAmount('end-of-month', parseFloat(e.currentTarget.value) || 0)}
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Paycheck Summaries -->
		<div class="paycheck-summaries">
			<div class="summary-card mid-month">
				<h3>📅 Mid-Month Paycheck</h3>
				<div class="summary-details">
					<div class="summary-row">
						<span>Total:</span>
						<strong>{formatCurrency(state.midMonthPaycheckAmount)}</strong>
					</div>
					<div class="summary-row">
						<span>Allocated:</span>
						<span>{formatCurrency(midMonthAllocated)}</span>
					</div>
					<div class="summary-row remaining" class:negative={midMonthRemaining < 0}>
						<span>Remaining:</span>
						<strong>{formatCurrency(midMonthRemaining)}</strong>
					</div>
				</div>
			</div>
			<div class="summary-card end-month">
				<h3>📅 End-of-Month Paycheck</h3>
				<div class="summary-details">
					<div class="summary-row">
						<span>Total:</span>
						<strong>{formatCurrency(state.endMonthPaycheckAmount)}</strong>
					</div>
					<div class="summary-row">
						<span>Allocated:</span>
						<span>{formatCurrency(endMonthAllocated)}</span>
					</div>
					<div class="summary-row remaining" class:negative={endMonthRemaining < 0}>
						<span>Remaining:</span>
						<strong>{formatCurrency(endMonthRemaining)}</strong>
					</div>
				</div>
			</div>
		</div>

		<!-- Buckets Section -->
		<section class="buckets-section">
			<div class="section-header">
				<h2>🪣 Budget Buckets</h2>
				<button class="btn-primary" onclick={openAddBucket}>+ Add Bucket</button>
			</div>

			{#if state.buckets.length === 0}
				<div class="empty-state">
					<p>No buckets yet! Add your first bucket to get started.</p>
				</div>
			{:else}
				<!-- Mid-Month Buckets -->
				{@const midMonthBuckets = getBucketsByPaycheck(state.buckets, 'mid-month')}
				{#if midMonthBuckets.length > 0}
					<div class="bucket-group">
						<h3 class="group-title mid-month-title">Mid-Month Buckets</h3>
						<div class="buckets-grid">
							{#each midMonthBuckets as bucket (bucket.id)}
								<div class="bucket-card">
									<div class="bucket-header">
										<div>
											<h4>{bucket.name}</h4>
											<span class="bucket-category">{getCategoryLabel(bucket.category)}</span>
										</div>
										<div class="bucket-actions">
											<button class="btn-icon" onclick={() => openEditBucket(bucket)} title="Edit">✏️</button>
											<button class="btn-icon" onclick={() => deleteBucket(bucket.id)} title="Delete">🗑️</button>
										</div>
									</div>
									<div class="bucket-body">
                                                                                <div class="amount-input">
                                                                                        <label for={`mid-month-${bucket.id}-current`}>Current Amount:</label>
                                                                                        <div class="input-group">
                                                                                                <span class="currency-symbol">$</span>
                                                                                                <input
                                                                                                        id={`mid-month-${bucket.id}-current`}
                                                                                                        type="number"
                                                                                                        min="0"
                                                                                                        step="0.01"
													value={bucket.currentAmount}
													oninput={(e) => updateBucketAmount(bucket.id, parseFloat(e.currentTarget.value) || 0)}
												/>
											</div>
										</div>
										<div class="target-amount">
											<span>Target: {formatCurrency(bucket.targetAmount)}</span>
										</div>
										<div class="progress-bar">
											<div
												class="progress-fill"
												style="width: {getProgressPercentage(bucket.currentAmount, bucket.targetAmount)}%"
											></div>
										</div>
										<div class="progress-text">
											{getProgressPercentage(bucket.currentAmount, bucket.targetAmount).toFixed(0)}% funded
										</div>
										{#if bucket.notes}
											<div class="bucket-notes">{bucket.notes}</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- End-of-Month Buckets -->
				{@const endMonthBuckets = getBucketsByPaycheck(state.buckets, 'end-of-month')}
				{#if endMonthBuckets.length > 0}
					<div class="bucket-group">
						<h3 class="group-title end-month-title">End-of-Month Buckets</h3>
						<div class="buckets-grid">
							{#each endMonthBuckets as bucket (bucket.id)}
								<div class="bucket-card">
									<div class="bucket-header">
										<div>
											<h4>{bucket.name}</h4>
											<span class="bucket-category">{getCategoryLabel(bucket.category)}</span>
										</div>
										<div class="bucket-actions">
											<button class="btn-icon" onclick={() => openEditBucket(bucket)} title="Edit">✏️</button>
											<button class="btn-icon" onclick={() => deleteBucket(bucket.id)} title="Delete">🗑️</button>
										</div>
									</div>
									<div class="bucket-body">
                                                                                <div class="amount-input">
                                                                                        <label for={`end-month-${bucket.id}-current`}>Current Amount:</label>
                                                                                        <div class="input-group">
                                                                                                <span class="currency-symbol">$</span>
                                                                                                <input
                                                                                                        id={`end-month-${bucket.id}-current`}
                                                                                                        type="number"
                                                                                                        min="0"
                                                                                                        step="0.01"
													value={bucket.currentAmount}
													oninput={(e) => updateBucketAmount(bucket.id, parseFloat(e.currentTarget.value) || 0)}
												/>
											</div>
										</div>
										<div class="target-amount">
											<span>Target: {formatCurrency(bucket.targetAmount)}</span>
										</div>
										<div class="progress-bar">
											<div
												class="progress-fill"
												style="width: {getProgressPercentage(bucket.currentAmount, bucket.targetAmount)}%"
											></div>
										</div>
										<div class="progress-text">
											{getProgressPercentage(bucket.currentAmount, bucket.targetAmount).toFixed(0)}% funded
										</div>
										{#if bucket.notes}
											<div class="bucket-notes">{bucket.notes}</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</section>
	</div>
</main>

<!-- Add/Edit Bucket Modal -->
{#if showAddBucket}
        <div
                class="modal-overlay"
                
                tabindex="0"
                onclick={(event) => {
                        if (event.target === event.currentTarget) {
                                closeForm();
                        }
                }}
                onkeydown={handleOverlayKeydown}
        >
                <div class="modal" role="dialog" aria-modal="true">
			<h3>{editingBucket ? 'Edit Bucket' : 'Add New Bucket'}</h3>
			<form onsubmit={(e) => { e.preventDefault(); saveBucket(); }}>
				<div class="form-group">
					<label for="bucket-name">Bucket Name *</label>
					<input
						id="bucket-name"
						type="text"
						bind:value={formName}
						placeholder="e.g., Rent, Netflix, Emergency Fund"
						required
					/>
				</div>

				<div class="form-group">
					<label for="bucket-category">Category *</label>
					<select id="bucket-category" bind:value={formCategory}>
						{#each categories as category}
							<option value={category}>{getCategoryLabel(category)}</option>
						{/each}
					</select>
					<small class="hint">
						{#if getCategoryPaycheck(formCategory) === 'mid-month'}
							Covered by mid-month paycheck
						{:else}
							Covered by end-of-month paycheck
						{/if}
					</small>
				</div>

				<div class="form-group">
					<label for="bucket-target">Target Amount *</label>
					<div class="input-group">
						<span class="currency-symbol">$</span>
						<input
							id="bucket-target"
							type="number"
							min="0"
							step="0.01"
							bind:value={formTargetAmount}
							required
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="bucket-current">Current Amount</label>
					<div class="input-group">
						<span class="currency-symbol">$</span>
						<input
							id="bucket-current"
							type="number"
							min="0"
							step="0.01"
							bind:value={formCurrentAmount}
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="bucket-notes">Notes (optional)</label>
					<textarea
						id="bucket-notes"
						bind:value={formNotes}
						placeholder="Any additional details..."
						rows="3"
					></textarea>
				</div>

				<div class="modal-actions">
					<button type="button" class="btn-secondary" onclick={closeForm}>Cancel</button>
					<button type="submit" class="btn-primary">
						{editingBucket ? 'Save Changes' : 'Add Bucket'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	main {
		padding: 2rem 1rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		color: white;
		margin-bottom: 2rem;
	}

	header h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	header p {
		margin: 0.5rem 0 0;
		font-size: 1.1rem;
		opacity: 0.9;
	}

	.container {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	/* Paycheck Configuration */
	.paycheck-config {
		margin-bottom: 2rem;
	}

	.paycheck-config h2 {
		margin-top: 0;
		color: #333;
	}

	.paycheck-inputs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.paycheck-input label {
		display: block;
		margin-bottom: 0.5rem;
		color: #555;
	}

	.paycheck-input strong {
		display: block;
		color: #333;
		font-size: 1.1rem;
	}

	.hint {
		display: block;
		font-size: 0.85rem;
		color: #888;
		margin-top: 0.25rem;
	}

	.input-group {
		position: relative;
		display: flex;
		align-items: center;
	}

	.currency-symbol {
		position: absolute;
		left: 12px;
		color: #666;
		font-weight: 500;
		pointer-events: none;
	}

	.input-group input {
		width: 100%;
		padding: 0.75rem 0.75rem 0.75rem 2rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.input-group input:focus {
		outline: none;
		border-color: #667eea;
	}

	/* Paycheck Summaries */
	.paycheck-summaries {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.summary-card {
		padding: 1.5rem;
		border-radius: 12px;
		border: 2px solid;
	}

	.summary-card.mid-month {
		background: #fff5f5;
		border-color: #ffa5a5;
	}

	.summary-card.end-month {
		background: #f0f9ff;
		border-color: #90cdf4;
	}

	.summary-card h3 {
		margin: 0 0 1rem;
		font-size: 1.2rem;
		color: #333;
	}

	.summary-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.summary-row.remaining {
		padding-top: 0.75rem;
		border-top: 2px solid rgba(0, 0, 0, 0.1);
		font-size: 1.1rem;
	}

	.summary-row.remaining.negative strong {
		color: #e53e3e;
	}

	/* Buckets Section */
	.buckets-section {
		margin-top: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		margin: 0;
		color: #333;
	}

	.bucket-group {
		margin-bottom: 2rem;
	}

	.group-title {
		margin: 0 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid;
		font-size: 1.3rem;
	}

	.group-title.mid-month-title {
		border-color: #ffa5a5;
		color: #c53030;
	}

	.group-title.end-month-title {
		border-color: #90cdf4;
		color: #2c5282;
	}

	.buckets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.bucket-card {
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		background: white;
		transition: box-shadow 0.2s;
	}

	.bucket-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.bucket-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 1rem;
	}

	.bucket-header h4 {
		margin: 0 0 0.25rem;
		color: #333;
		font-size: 1.2rem;
	}

	.bucket-category {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		font-size: 0.85rem;
		color: #4a5568;
	}

	.bucket-actions {
		display: flex;
		gap: 0.5rem;
	}

	.bucket-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.amount-input label {
		display: block;
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.target-amount {
		font-size: 0.9rem;
		color: #666;
	}

	.progress-bar {
		height: 8px;
		background: #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.9rem;
		color: #666;
		text-align: center;
	}

	.bucket-notes {
		padding: 0.75rem;
		background: #f7fafc;
		border-left: 3px solid #667eea;
		border-radius: 4px;
		font-size: 0.9rem;
		color: #555;
		font-style: italic;
	}

	/* Buttons */
	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: #e0e0e0;
		color: #333;
	}

	.btn-secondary:hover {
		background: #d0d0d0;
	}

	.btn-icon {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.25rem;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.btn-icon:hover {
		opacity: 1;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #666;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal h3 {
		margin: 0 0 1.5rem;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: 500;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group small {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: #888;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		main {
			padding: 1rem 0.5rem;
		}

		.container {
			padding: 1.5rem;
		}

		header h1 {
			font-size: 2rem;
		}

		.buckets-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.modal {
			padding: 1.5rem;
		}
	}
</style>
