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

## 🎨 Built With Love

This project uses modern tools but keeps things simple:
- **React** - For building user interfaces
- **Vite** - For fast development and building
- **Radix UI** - For accessible, beautiful components
- **Tailwind CSS** - For styling without the headaches

---

*Remember: Good code is written for humans to read, not just for computers to execute.*
