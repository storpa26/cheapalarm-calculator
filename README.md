# CheapAlarm - Advanced Shopping Cart System

A modern, human-readable shopping cart calculation system built with React and designed for easy integration into WordPress projects.

## 🎯 What This Project Does

This is a sophisticated shopping cart system that handles complex product calculations, discounts, and pricing logic. It's built to be crystal clear for any developer to understand and maintain.

## 🏗️ Project Structure

Our codebase is organized like a well-structured house - everything has its place:

```
src/
├── components/          # All our React components live here
│   ├── Cart/           # Shopping cart related components
│   ├── Product/        # Product display and management
│   └── UI/             # Reusable UI elements (buttons, modals, etc.)
├── hooks/              # Custom React hooks for state management
├── utils/              # Pure JavaScript functions for calculations
├── constants/          # Configuration values and settings
├── styles/             # CSS and styling files
└── docs/               # Additional documentation files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone this repository
2. Navigate to the project folder
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 How It Works

### The Big Picture

Think of this cart system like a smart calculator that:

1. **Tracks Products** - Keeps track of what customers want to buy
2. **Calculates Prices** - Handles complex pricing rules, discounts, and taxes
3. **Manages Quantities** - Updates totals when customers change quantities
4. **Applies Discounts** - Automatically applies the best deals for customers

### Key Features

- **Complex Pricing Logic** - Handles bulk discounts, tiered pricing, and promotional codes
- **Real-time Updates** - Cart totals update instantly as customers make changes
- **Mobile Friendly** - Works perfectly on phones, tablets, and desktops
- **WordPress Ready** - Designed for easy integration with WordPress themes

## 📁 File Organization Philosophy

We follow the "principle of least surprise" - if you're looking for something, it should be exactly where you'd expect it to be:

- **Components** are organized by feature (Cart, Product, UI)
- **Utils** contain pure functions that do one thing well
- **Hooks** manage state and side effects
- **Constants** keep all our configuration in one place

## 🔧 Development Guidelines

### Code Style

- Write code like you're explaining it to a friend
- Use descriptive variable names (no cryptic abbreviations)
- Comment the "why", not just the "what"
- Keep functions small and focused on one task

### Documentation Standards

Every file should have:

- A clear description of what it does
- Examples of how to use it
- Notes about any tricky parts

## 🌐 WordPress Integration

This cart system is designed to be easily integrated into WordPress:

1. **Build Process** - Run `npm run build` to create production files
2. **Enqueue Method** - Use WordPress's `wp_enqueue_script()` in your child theme
3. **Data Integration** - Connect with WooCommerce or custom product data
4. **Styling** - Customize appearance to match your theme

## 🤝 For Future Developers

If you're new to this project, start here:

1. Read this README completely
2. Look at the folder structure
3. Check out the `/docs` folder for detailed guides
4. Run the project locally and play around with it

## 📚 Additional Resources

- `/src/docs/` - Detailed technical documentation
- Component examples and usage guides
- WordPress integration tutorials
- Troubleshooting common issues

## 🧪 Local Portal Account Testing

Quick checklist for exercising the new customer portal flow on localhost:

1. **Configure API base.** Create or update `.env.local` with `VITE_API_BASE_URL=http://localhost:10013` (swap the port for your local WordPress site) so the React app proxies requests correctly when you run `npm run dev`.
2. **Run both stacks.** Start your local WordPress instance with the `cheapalarms-plugin` activated, then run `npm run dev` in this repo to launch the portal UI.
3. **Open a portal link.** Use an estimate ID available in your local database and visit `http://localhost:5173/portal?estimateId=ESTIMATE_ID&locationId=LOCATION_ID`.
4. **Simulate acceptance.** Mark the estimate as accepted in GHL (or mock it via the API). The WordPress plugin will detect the accepted state, automatically create/update the customer user, and log both the invite link and password-reset URL to the console.
5. **Verify status.** Inspect the WordPress Users table, open `/wp-json/ca/v1/portal/status?estimateId=ESTIMATE_ID&locationId=LOCATION_ID` to confirm invite metadata, and log in as the customer to view the `/portal` dashboard.

Repeat as needed before pushing to staging to ensure invites, metadata, and portal links behave as expected.

## 🔗 Serving the Portal from WordPress

The plugin now exposes `/portal` on your WordPress site and automatically loads the React bundle:

1. Deploy the built assets to your active theme at `wp-content/themes/<theme>/react-app/` (same bundle used for the admin dashboard) and ensure the Vite manifest exists at `react-app/.vite/manifest.json`.
2. Activate (or re-activate) the **CheapAlarms Platform Bridge** plugin so the new rewrite rule flushes. If the page 404s after updating code, visit _Settings → Permalinks_ and click **Save** once to refresh rewrites.
3. Browse to `https://your-site.com/portal`. Logged-in customers see the new dashboard (quotes, invites, reset links, install status); unauthenticated visitors are redirected to the WordPress login page and, after signing in, returned straight to `/portal`.

The template sets `window.caPortalMode`, injects the invite token, and points the frontend at the correct API base, so customer invite links generated by WordPress now resolve without additional setup.
