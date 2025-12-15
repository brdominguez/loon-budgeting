# 🦆 Loon Budgeting
[![CI](https://github.com/brdominguez/loon-budgeting/actions/workflows/ci.yml/badge.svg)](https://github.com/brdominguez/loon-budgeting/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/brdominguez/loon-budgeting/actions/workflows/deploy.yml/badge.svg)](https://github.com/brdominguez/loon-budgeting/actions/workflows/deploy.yml)

A **frontend-only SvelteKit** personal budgeting app using a **paycheck-segmented bucket system**.

## 💡 Concept

Loon Budgeting implements a unique budgeting approach where two semi-monthly paychecks have distinct roles:

- **Mid-Month Paycheck**: Covers late bills and flexible spending
- **End-of-Month Paycheck**: Covers early bills, groceries, savings, and stability (including an intentional buffer)

This system embraces variability and uses buckets to express intent rather than strict enforcement, creating a low-stress budgeting experience.

## ✨ Features

- 🎯 **Paycheck-Segmented Buckets**: Organize expenses by which paycheck covers them
- 💰 **Six Bucket Categories**:
  - Early Bills (end-of-month paycheck)
  - Late Bills (mid-month paycheck)
  - Groceries (end-of-month paycheck)
  - Savings (end-of-month paycheck)
  - Flexible Spending (mid-month paycheck)
  - Buffer (end-of-month paycheck) - intentional cushion for variability
- 📊 **Visual Progress Tracking**: See funding progress for each bucket
- 💾 **Local Storage**: All data persists in your browser - no backend, no accounts, no tracking
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Clean, Modern UI**: Beautiful gradient design with intuitive controls

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brdominguez/loon-budgeting.git
cd loon-budgeting
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Running Tests

Execute the unit test suite with coverage:

```bash
npm run test:coverage
```

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

The static site will be generated in the `build` directory. You can serve it with any static file server or deploy it to platforms like:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any static hosting service

To preview the production build locally:

```bash
npm run preview
```

## 📖 How to Use

### 1. Set Your Paycheck Amounts

Enter your mid-month and end-of-month paycheck amounts at the top of the page. The system will track how much you've allocated from each paycheck.

### 2. Create Buckets

Click "+ Add Bucket" to create a new budget category:

- **Name**: Give your bucket a descriptive name (e.g., "Rent", "Netflix", "Emergency Fund")
- **Category**: Choose which type of expense this is
  - The app will automatically assign it to the correct paycheck
- **Target Amount**: How much you want to allocate to this bucket
- **Current Amount**: How much is currently in this bucket (optional)
- **Notes**: Add any additional context (optional)

### 3. Track Your Progress

- Each bucket shows a progress bar indicating how much of the target is funded
- The paycheck summaries show total allocated vs. remaining for each paycheck
- Update "Current Amount" as you spend or save

### 4. Manage Buckets

- **Edit**: Click the pencil icon (✏️) to modify a bucket
- **Delete**: Click the trash icon (🗑️) to remove a bucket
- Your data is automatically saved to local storage

## 🛡️ Privacy & Data

- **100% Local**: All data is stored in your browser's local storage
- **No Backend**: No servers, no databases, no user accounts
- **No Tracking**: No analytics, no cookies, no data collection
- **Your Data, Your Device**: Export or clear your data anytime by clearing browser storage

## 🎨 Design Philosophy

This budgeting system is designed to be:

- **Intent-Focused**: Buckets express what you want to do with your money, not rigid rules
- **Variability-Friendly**: The buffer bucket acknowledges that life isn't perfectly predictable
- **Low-Stress**: Simple, visual interface without overwhelming details
- **Flexible**: Adjust targets and amounts as your situation changes

## 🔧 Technology Stack

- **SvelteKit**: Modern, reactive UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Local Storage**: Simple, persistent client-side data storage
- **Static Adapter**: Deploy anywhere as static files

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

If you have questions or need help, please open an issue on GitHub.
