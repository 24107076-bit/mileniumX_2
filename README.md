# 🌌 MileniumX — The Life Financial Engine

**MileniumX** is a high-performance, AI-powered wealth simulator designed to transform static numbers into a living, breathing financial trajectory. Unlike traditional retirement calculators, MileniumX uses forward-simulation logic to model your entire life from age 20 to 80, accounting for Every variable, every drawdown, and every dream.

---

## 🚀 Unique Selling Proposition (USP)
- **Life-Cycle Drawdown Logic**: Traditional calculators assume linear growth. MileniumX calculates "Capital Drawdown Impact"—meaning achieving a milestone today (like buying a home) correctly reduces your compounding base for all future years, giving you a brutally honest look at your financial future.
- **Interactive AI Navigation**: The built-in Groq-powered Copilot doesn't just answer questions; it can actually control the interface, redirecting you to relevant pages like the Quiz or Analysis tabs upon request.
- **Premium Fluid Aesthetics**: A state-of-the-art "Glassmorphic" interface powered by Spline 3D and GSAP, designed to make financial planning feel like a premium experience rather than a chore.

---

## 🛠️ Tech Stack
- **Core**: React 19 + Vite (Ultra-fast HMR)
- **Visuals**: Spline (3D Scenes), GSAP (Micro-animations), Recharts (Dynamic Data Viz)
- **Backend / Auth**: [Supabase](https://supabase.com) (Secure Authentication & Real-time Persistence)
- **Intelligence**: [Groq AI](https://groq.com) (Llama 3-8B) for context-aware financial guidance
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Modern Fluid Design System)

---

## ✨ Features
- **Compound Projection Arc**: View your net worth trajectory with real-time recalculation as you slide variables.
- **Milestone Management**: Drag-and-drop life events (Apartment, Studio, Startup, Retirement) onto your timeline.
- **AI Copilot Widget**: A floating interactive assistant that offers Debt Avalanche strategies and helps you navigate the platform.
- **Gamified IQ Quiz**: Test your financial literacy with a 5-step interactive challenge and earn your competency badge.
- **Dynamic Scenarios**: Toggle Inflation adjustments, Step-Up SIP percentages, and Variable ROI to stress-test your plan.
- **Secure Authentication**: Full Sign-In/Sign-Up flow with session persistence via Supabase.

---

## 🎯 MVP (Minimum Viable Product)
- [x] High-fidelity Landing Page with 3D hero elements.
- [x] Core forward-simulation engine for Net Worth and Cashflow.
- [x] Secure Supabase Authentication (Real user creation).
- [x] Functional "Financial IQ" Quiz.
- [x] Groq-powered Chatbox with UI navigation hooks.

---

## 📂 Project Structure
```bash
src/
├── components/      # UI Components (Charts, Panels, Chatbox)
├── context/         # Simulation Engine (Logic & State)
├── lib/             # Third-party initializations (Supabase)
├── pages/           # High-level Views (Landing, Auth, Quiz)
└── index.css        # Core Design System
```

## 🏁 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file with your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GROQ_API_KEY`.
4. Run locally: `npm run dev`.
5. Build for production: `npm run build`.

---
*Built for the next generation of wealth builders. © 2026 MileniumX.*
