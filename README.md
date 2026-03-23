# FuelWise

> Eat with purpose — Ăn vì sức khỏe, không chỉ vì no

FuelWise is an AI-powered recipe generator and nutrition tracker. It calculates your daily macro targets based on your body stats and fitness goal, then uses Claude AI to generate personalized recipes that fit your remaining macros for the day.

---

## Features

- **Onboarding** — collect personal stats (age, weight, height, goal, activity level) with metric/imperial support
- **TDEE Calculator** — Mifflin-St Jeor formula to compute daily calorie and macro targets (protein / carbs / fat)
- **AI Recipe Generator** — powered by Claude AI (Haiku), generates recipes from your available ingredients adjusted to your remaining macros and meal size
- **Meal Size Control** — Light (25%), Medium (40%), Full (60%) scaling of remaining macros per meal
- **Meal Logger** — log meals to track daily nutrition intake, delete logged meals
- **Saved Recipes** — save and filter recipes by meal type (breakfast, lunch, dinner, snack)
- **EN / VI Language Toggle** — full bilingual support with Vietnamese cuisine as default
- **Search Online** — find any generated recipe on Google with one click

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| State management | Zustand (persisted to localStorage) |
| Routing | React Router v6 |
| Animation | Framer Motion |
| AI | Anthropic Claude API (claude-haiku-4-5) |
| Font | Merriweather (Google Fonts) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/nhatnam0110/fuelwise.git
cd fuelwise
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

> Never commit your `.env` file. It is already listed in `.gitignore`.

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## License

MIT
