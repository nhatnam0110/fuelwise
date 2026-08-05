# FuelWise Mobile — Master Project Plan
> Copy this file to the mobile project root as `CLAUDE.md` so every new Claude Code
> session loads full context automatically.
>
> Last updated: 2026-05-20 | Author: Nam Le | Target: React Native Expo → App Store

---

## 0. Purpose of This Document

This is the single source of truth for the FuelWise mobile project.
It documents every decision made, every type defined, every API wired, and the exact
phase-by-phase build order. When the conversation compacts or a new session starts,
read this file first before doing anything.

---

## 1. Project Overview

**FuelWise** is a nutrition-tracking app with AI-powered recipe generation.

| Item | Value |
|---|---|
| Platform | iOS first, Android second |
| Framework | React Native + Expo SDK 53 (managed workflow) |
| Distribution | App Store (TestFlight → production) |
| Bundle ID | `com.namle.fuelwise` |
| Version | 1.0.0 |
| Purpose | Internship portfolio project (React Native role) |
| Language | TypeScript strict mode throughout |

### Feature List (all screens)

| Screen | Route | Description |
|---|---|---|
| Login | `/(auth)/login` | Email/password + Google sign-in |
| Register | `/(auth)/register` | Create account |
| Onboarding | `/onboarding` | 4-step wizard: info → goal → activity → targets |
| Dashboard | `/(tabs)/` | Calorie ring, macro bars, today's meals |
| Generator | `/(tabs)/generate` | Ingredient input → Claude AI → recipe |
| Recipe Result | `/recipe/[id]` | Full recipe, log meal, save actions |
| Saved | `/(tabs)/saved` | Recipe collection filtered by meal type |
| Progress | `/(tabs)/progress` | Weight chart, milestones, weight log history |
| History | `/(tabs)/history` | Meal log by date |
| Settings | `/settings` | Edit profile & goals, language toggle |
| Food Search Modal | modal | Open Food Facts search, log direct food |

---

## 2. Web App Analysis (Source of Truth)

The mobile app is a PORT of the existing web app at `e:\Nam\Coding\workspace\foodApp\fuelwise`.
The web app is built with React 19 + Vite + TypeScript + Zustand + Tailwind CSS.

### Web App Routes

```
/onboarding   → 4-step onboarding stepper
/dashboard    → main screen
/generate     → recipe generator
/recipe/:id   → recipe result
/saved        → saved recipes
/progress     → weight tracking + milestones
/history      → meal log history
/settings     → profile settings
```

### Reuse Decision Per Module

| Web path | Mobile decision | Notes |
|---|---|---|
| `src/types/*.ts` | COPY directly | Pure interfaces, zero changes needed |
| `src/state/types.ts` | COPY directly | No changes |
| `src/state/slices/logSlice.ts` | COPY directly | Pure business logic |
| `src/state/slices/recipeSlice.ts` | COPY directly | Pure business logic |
| `src/state/slices/generatorSlice.ts` | COPY directly | Pure business logic |
| `src/state/slices/uiSlice.ts` | COPY directly | Pure business logic |
| `src/state/slices/languageSlice.ts` | COPY directly | Pure business logic |
| `src/state/slices/weightSlice.ts` | COPY directly | Pure business logic |
| `src/state/slices/userSlice.ts` | ADAPT | Add `firebaseUid: string \| null` |
| `src/state/index.ts` | ADAPT | Replace localStorage persist → AsyncStorage |
| `src/lib/tdee.ts` | COPY directly | Pure math |
| `src/lib/utils.ts` | ADAPT | Remove `copyToClipboard` (uses `navigator.clipboard`) |
| `src/i18n/en.ts` | COPY directly | |
| `src/i18n/vi.ts` | COPY directly | |
| `src/hooks/useT.ts` | COPY directly | Zustand only |
| `src/features/nutrition/types.ts` | COPY directly | |
| `src/features/nutrition/hooks/useFoodSearch.ts` | COPY directly | |
| `src/features/generator/hooks/useGenerator.ts` | ADAPT | Replace `useNavigate` → `useRouter` |
| `src/features/progress/hooks/useProgressStats.ts` | ADAPT | Replace lucide-react icons → lucide-react-native |
| `src/lib/claude.ts` | ADAPT | Change `fetch('/api/generate')` → direct Anthropic API + SecureStore key |
| `src/features/nutrition/services/openFoodFacts.ts` | ADAPT | Change `/api/off/...` → direct `https://world.openfoodfacts.org/...` |
| All UI components | REWRITE | Tailwind HTML → NativeWind RN components |
| `react-router-dom` | REPLACE with `expo-router` | |
| `framer-motion` | REPLACE with `react-native-reanimated` | |
| `recharts` | REPLACE with `victory-native` (Skia) | |
| `lucide-react` | REPLACE with `lucide-react-native` | |

---

## 3. Complete Type Definitions

These are the exact types from the web app. Do NOT change them — they are the
contract between web logic and mobile UI.

### `src/types/recipe.ts`
```ts
export interface Ingredient {
  name: string
  amount: string
}

export interface Nutrition {
  calories: number
  protein: number   // grams
  carbs: number     // grams
  fat: number       // grams
}

export interface Recipe {
  id: string
  title: string
  description: string
  cuisine: string
  cookTime: string
  servings: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: Ingredient[]
  steps: string[]
  nutrition: Nutrition
  dietaryTags: string[]
  macroFitScore?: number   // 0–100
  savedAt?: number         // timestamp ms
}
```

### `src/types/user.ts`
```ts
export interface UserProfile {
  name: string
  age: number
  weight: number      // kg
  height: number      // cm
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
  goal: 'lose' | 'gain' | 'maintain'
  onboardingComplete: boolean
}

export interface MacroTargets {
  calories: number
  protein: number   // grams
  carbs: number     // grams
  fat: number       // grams
}
```

### `src/types/log.ts`
```ts
import type { Nutrition } from './recipe'

export interface LoggedMeal {
  recipeId: string
  recipeTitle: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  nutrition: Nutrition
  loggedAt: number   // timestamp ms
}

export interface DailyLog {
  date: string       // "2026-03-18"
  meals: LoggedMeal[]
  totals: Nutrition
}

export interface GeneratorInput {
  ingredients: string[]
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  dietaryFilters: string[]
  cuisine: string
  mealSize: 'light' | 'medium' | 'full'
}
```

### `src/types/weight.ts`
```ts
export interface WeightEntry {
  id: string
  weight: number    // kg
  loggedAt: number  // timestamp ms
  note?: string
}
```

### `src/features/nutrition/types.ts`
```ts
export interface FoodProduct {
  id: string
  name: string
  per100g: { calories: number; protein: number; carbs: number; fat: number }
}
```

---

## 4. State Architecture

### Store Slice Interfaces

```ts
// userSlice — ADAPTED (adds firebaseUid)
interface UserSlice {
  profile: UserProfile | null
  macroTargets: MacroTargets | null
  firebaseUid: string | null           // ADDED for mobile
  setProfile: (profile: UserProfile) => void
  setMacroTargets: (targets: MacroTargets) => void
  setFirebaseUid: (uid: string | null) => void  // ADDED for mobile
}

// logSlice — IDENTICAL to web
interface LogSlice {
  dailyLog: DailyLog | null
  logHistory: DailyLog[]
  logMeal: (meal: LoggedMeal) => void
  deleteLoggedMeal: (loggedAt: number) => void
  resetDailyLog: () => void
  getRemainingMacros: () => Nutrition
}

// recipeSlice — IDENTICAL to web
interface RecipeSlice {
  currentRecipe: Recipe | null
  savedRecipes: Recipe[]
  setCurrentRecipe: (recipe: Recipe) => void
  saveRecipe: (recipe: Recipe) => void
  deleteRecipe: (id: string) => void
}

// generatorSlice — IDENTICAL to web
interface GeneratorSlice {
  generatorInput: GeneratorInput
  updateGeneratorInput: (input: Partial<GeneratorInput>) => void
}

// uiSlice — IDENTICAL to web
interface UiSlice {
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// languageSlice — IDENTICAL to web
interface LanguageSlice {
  language: 'en' | 'vi'
  setLanguage: (lang: 'en' | 'vi') => void
}

// weightSlice — IDENTICAL to web
interface WeightSlice {
  weightEntries: WeightEntry[]
  goalWeight: number | null
  logWeight: (weight: number, note?: string) => void
  deleteWeight: (id: string) => void
  setGoalWeight: (weight: number) => void
}

type AppStore = UserSlice & LogSlice & RecipeSlice &
                GeneratorSlice & UiSlice & LanguageSlice & WeightSlice
```

### Persisted Keys (AsyncStorage)

```ts
// In state/index.ts partialize:
{
  profile, macroTargets, firebaseUid,
  savedRecipes, dailyLog, logHistory,
  language, weightEntries, goalWeight,
}
// currentRecipe, isLoading, error, generatorInput are NOT persisted
```

### Firestore Sync Keys (per user UID)

```
/users/{uid}/data  →  same fields as persisted keys above
```

Sync strategy: on login, load Firestore → hydrate store. On key mutations (logMeal,
saveRecipe, logWeight, setProfile), write to Firestore in the background (fire and forget).

---

## 5. Tech Stack (Exact Versions)

```json
{
  "expo": "~53.0.0",
  "expo-router": "~4.0.0",
  "react": "18.3.2",
  "react-native": "0.76.x",
  "typescript": "^5.3.0",

  "zustand": "^5.0.12",
  "@react-native-async-storage/async-storage": "^2.1.0",

  "nativewind": "^4.1.0",
  "tailwindcss": "^3.4.0",
  "react-native-safe-area-context": "^4.12.0",
  "react-native-screens": "^4.4.0",

  "react-native-reanimated": "^3.16.0",
  "react-native-gesture-handler": "^2.21.0",

  "victory-native": "^41.0.0",
  "@shopify/react-native-skia": "^1.5.0",

  "lucide-react-native": "^0.477.0",
  "react-native-svg": "^15.8.0",

  "firebase": "^11.0.0",
  "expo-auth-session": "^6.0.0",
  "expo-crypto": "^14.0.0",

  "expo-secure-store": "^14.0.0",
  "expo-font": "^13.0.0",
  "expo-splash-screen": "^0.29.0",
  "expo-status-bar": "^2.0.0",
  "expo-haptics": "^14.0.0",
  "expo-linear-gradient": "^14.0.0",
  "expo-constants": "^17.0.0",

  "@anthropic-ai/sdk": "^0.79.0"
}
```

**Key decisions:**
- `nativewind@4` uses `tailwindcss@3` (NOT v4) — do not upgrade tailwindcss
- `victory-native@41+` requires `@shopify/react-native-skia` as peer dep
- Firebase JS SDK v11 modular — use `getReactNativePersistence(AsyncStorage)` for auth token survival
- `expo-router@4` requires `scheme` set in `app.config.ts` for deep links and OAuth redirects

---

## 6. Firebase Architecture

### Auth Providers
- Email / Password (required)
- Google Sign-In via `expo-auth-session` + `GoogleAuthProvider.credential(idToken)`

### Firebase Init (`src/firebase/config.ts`)
```ts
// Read config from Constants.expoConfig.extra.firebaseConfig
// Guard against double-init: if (!getApps().length) initializeApp(config)
// auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
// db   = getFirestore(app)
```

### Auth Flow
```
App cold launch
  └─ onAuthStateChanged fires
      ├─ user = null  →  redirect to /(auth)/login
      └─ user exists
          ├─ onboardingComplete = false  →  redirect to /onboarding
          └─ onboardingComplete = true   →  allow (tabs)
```

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/data {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Environment Variables (`.env`)
```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
ANTHROPIC_API_KEY=        ← also stored in expo-secure-store at runtime
```

---

## 7. API Integrations

### Claude AI (Recipe Generation)

**Endpoint:** `POST https://api.anthropic.com/v1/messages`

**Headers:**
```
x-api-key: <from expo-secure-store key='ANTHROPIC_API_KEY'>
anthropic-version: 2023-06-01
content-type: application/json
```

**Request body:**
```json
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 1600,
  "system": "<buildSystemPrompt(language)>",
  "messages": [{ "role": "user", "content": "<buildUserPrompt(input, target, language)>" }]
}
```

**Meal size → macro % mapping:**
```ts
{ light: 0.25, medium: 0.40, full: 0.60 }
```

**Response shape expected:** Raw JSON Recipe object (no markdown wrapping).
Clean with: `raw.text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()`

**Error handling:** Check `res.ok`, parse `err.error`, rethrow as `Error`.

**API key storage flow:**
- On first launch after login: prompt user to enter their Anthropic API key
- Store with: `SecureStore.setItemAsync('ANTHROPIC_API_KEY', key)`
- Read with: `SecureStore.getItemAsync('ANTHROPIC_API_KEY')`
- If null: show "Configure API Key" prompt before allowing generation

### Open Food Facts

**Endpoint:** `GET https://world.openfoodfacts.org/cgi/search.pl`

**Query params:**
```
search_terms=<encoded query>
search_simple=1
action=process
json=1
page_size=8
fields=product_name,nutriments
```

**Response mapping:**
```ts
{
  id: generateId(),
  name: p.product_name,
  per100g: {
    calories: n['energy-kcal_100g'] ?? Math.round((n['energy_100g'] ?? 0) / 4.184),
    protein:  n['proteins_100g']      ?? 0,
    carbs:    n['carbohydrates_100g'] ?? 0,
    fat:      n['fat_100g']           ?? 0,
  }
}
```

Filter: only include products where `per100g.calories > 0`.
Debounce: 500ms before firing request (already in `useFoodSearch` hook).

---

## 8. Design System

### Color Palette (`src/constants/colors.ts`)
```ts
export const Colors = {
  background:        '#020b04',   // near-black green — screen bg
  backgroundOverlay: '#051107',   // app shell overlay
  surface:           '#0f1f12',   // card background
  surfaceHigh:       '#1a3320',   // elevated card / selected state
  primary:           '#4ade80',   // green-400 — main CTA, active icons
  primaryDark:       '#166534',   // green-800 — pressed CTA state
  textPrimary:       '#f0fdf4',   // near-white — main text
  textSecondary:     '#86efac',   // green-300 — secondary labels
  textMuted:         '#4b7a58',   // very muted — hints, disabled
  border:            '#1f3d27',   // subtle card borders
  error:             '#f87171',   // red-400
  warning:           '#fbbf24',   // amber-400
  // Macro colors
  macroProtein:      '#4ade80',   // green
  macroCarbs:        '#60a5fa',   // blue-400
  macroFat:          '#fbbf24',   // amber-400
  macroCalories:     '#f0fdf4',   // white
}
```

### Spacing & Layout (`src/constants/layout.ts`)
```ts
export const Spacing = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 }
export const Radius  = { sm:8, md:12, lg:16, xl:24, full:9999 }
export const FontSize = { xs:11, sm:13, base:15, lg:17, xl:20, xxl:24, xxxl:30 }
export const Layout  = { tabBarHeight:64, headerHeight:56 }
```

### NativeWind Config Notes
- `nativewind@4` + `tailwindcss@3` — do NOT use tailwindcss v4
- Extend `colors` with brand palette under `brand.` namespace
- `content`: `["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"]`
- `darkMode: 'class'`

---

## 9. Folder Structure

Architecture: **feature-based (component-based)** — each feature owns its components,
hooks, and services. Anything used by more than one feature lives in `shared/`.
State and Firebase stay top-level because they are intentionally global.

**The one rule:** if a file is imported by more than one feature → move it to `shared/`.

```
fuelwise-mobile/
├── app/                                    # expo-router file-based routes (thin — just screens)
│   ├── _layout.tsx                         # Root: fonts, auth guard, GestureHandlerRootView
│   ├── (auth)/
│   │   ├── _layout.tsx                     # Auth stack (dark bg, no tab bar)
│   │   ├── login.tsx                       # Renders <LoginForm />
│   │   └── register.tsx                    # Renders <RegisterForm />
│   ├── onboarding/
│   │   └── index.tsx                       # Renders <OnboardingStepper />
│   ├── (tabs)/
│   │   ├── _layout.tsx                     # Bottom tab bar (5 tabs + icons)
│   │   ├── index.tsx                       # Renders <DashboardScreen />
│   │   ├── generate.tsx                    # Renders <GeneratorScreen />
│   │   ├── saved.tsx                       # Renders <SavedScreen />
│   │   ├── progress.tsx                    # Renders <ProgressScreen />
│   │   └── history.tsx                     # Renders <HistoryScreen />
│   ├── recipe/
│   │   └── [id].tsx                        # Renders <RecipeResultScreen />
│   └── settings.tsx                        # Renders <SettingsScreen />
│
├── src/
│   │
│   ├── features/                           # One folder per feature — owns all its code
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx           # Email/password inputs + Google button
│   │   │   │   └── RegisterForm.tsx        # Name/email/password/confirm inputs
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts              # Firebase onAuthStateChanged listener
│   │   │   └── services/
│   │   │       └── firebase.ts             # signInWithEmail, signUpWithEmail, signInWithGoogle, signOut
│   │   │
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   │   ├── OnboardingStepper.tsx   # Step controller + progress dots
│   │   │   │   ├── StepPersonalInfo.tsx    # Name, gender, age, weight, height
│   │   │   │   ├── StepGoal.tsx            # lose / gain / maintain cards
│   │   │   │   ├── StepActivity.tsx        # sedentary / light / moderate / active cards
│   │   │   │   └── StepTargets.tsx         # Calculated targets preview + CTA
│   │   │   └── hooks/
│   │   │       └── useOnboarding.ts        # Step state, validation, submit → store + Firestore
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── DashboardScreen.tsx     # Screen root
│   │   │   │   ├── CalorieRing.tsx         # SVG ring — props: consumed, total
│   │   │   │   ├── MacroBar.tsx            # Animated bar — props: value, total, color, label
│   │   │   │   ├── MealCard.tsx            # Logged meal row with swipe-to-delete
│   │   │   │   └── GenerateCTA.tsx         # "Out of ideas? Generate a Meal" card
│   │   │   └── hooks/
│   │   │       └── useDashboard.ts         # Greeting logic, daily reset check
│   │   │
│   │   ├── generator/
│   │   │   ├── components/
│   │   │   │   ├── GeneratorScreen.tsx     # Screen root
│   │   │   │   ├── IngredientInput.tsx     # Tag chip input with keyboard toolbar Done btn
│   │   │   │   ├── FilterChip.tsx          # Pressable selectable chip (dietary, cuisine)
│   │   │   │   ├── MealSizeCard.tsx        # Light / Medium / Full selection card
│   │   │   │   └── RemainingMacrosSummary.tsx  # Compact macro targets display
│   │   │   ├── hooks/
│   │   │   │   └── useGenerator.ts         # Adapted from web — useRouter replaces useNavigate
│   │   │   └── services/
│   │   │       └── claude.ts               # Direct Anthropic API + SecureStore key read
│   │   │
│   │   ├── recipe/
│   │   │   └── components/
│   │   │       ├── RecipeResultScreen.tsx  # Screen root
│   │   │       ├── RecipeHeader.tsx        # Title, cuisine, cook time, servings, MacroFit badge
│   │   │       ├── NutritionRow.tsx        # 4-macro summary row
│   │   │       ├── IngredientsList.tsx     # Ingredients with amounts
│   │   │       ├── StepsList.tsx           # Numbered cooking steps
│   │   │       └── RecipeActions.tsx       # Log / Save / Try Another buttons
│   │   │
│   │   ├── saved/
│   │   │   └── components/
│   │   │       ├── SavedScreen.tsx         # Screen root
│   │   │       ├── RecipeCard.tsx          # Recipe summary card with view + delete
│   │   │       └── MealTypeFilter.tsx      # All/Breakfast/Lunch/Dinner/Snack tabs
│   │   │
│   │   ├── progress/
│   │   │   ├── components/
│   │   │   │   ├── ProgressScreen.tsx      # Screen root
│   │   │   │   ├── WeightChart.tsx         # Victory Native line chart — props: data, yDomain
│   │   │   │   ├── WeightModal.tsx         # Bottom sheet: weight input + optional note
│   │   │   │   ├── MilestonesGrid.tsx      # Badge grid with category filter
│   │   │   │   └── WeightHistory.tsx       # Weight log list with delete
│   │   │   └── hooks/
│   │   │       └── useProgressStats.ts     # Adapted from web — lucide-react-native icons
│   │   │
│   │   ├── history/
│   │   │   └── components/
│   │   │       ├── HistoryScreen.tsx       # Screen root
│   │   │       └── DayCard.tsx             # Expandable day row with meal list
│   │   │
│   │   ├── settings/
│   │   │   └── components/
│   │   │       ├── SettingsScreen.tsx      # Screen root
│   │   │       ├── ProfileForm.tsx         # Name, gender, age, weight, height inputs
│   │   │       ├── GoalSelector.tsx        # lose / gain / maintain cards
│   │   │       ├── ActivitySelector.tsx    # Activity level cards
│   │   │       └── ApiKeyInput.tsx         # Masked key display + edit → SecureStore
│   │   │
│   │   └── nutrition/                      # Food search — used by dashboard and recipe
│   │       ├── components/
│   │       │   └── FoodSearchModal.tsx     # Bottom sheet: search input + OFF results + log
│   │       ├── hooks/
│   │       │   └── useFoodSearch.ts        # Copied from web — 500ms debounce
│   │       ├── services/
│   │       │   └── openFoodFacts.ts        # Direct OFF API (no proxy)
│   │       └── types.ts                    # FoodProduct interface
│   │
│   ├── shared/                             # Used by 2+ features → lives here
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx              # variants: primary | outline | ghost
│   │   │   │   ├── Card.tsx                # Dark semi-transparent surface
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Separator.tsx
│   │   │   └── layout/
│   │   │       ├── ScreenWrapper.tsx       # SafeAreaView + dark bg + optional scroll
│   │   │       └── KeyboardWrapper.tsx     # KeyboardAvoidingView (ios:padding / android:height)
│   │   ├── hooks/
│   │   │   └── useT.ts                     # i18n hook — used by every feature
│   │   ├── types/                          # Copied from web — do not change shapes
│   │   │   ├── recipe.ts
│   │   │   ├── user.ts
│   │   │   ├── log.ts
│   │   │   └── weight.ts
│   │   ├── lib/
│   │   │   ├── tdee.ts                     # Copied from web — pure math
│   │   │   └── utils.ts                    # Adapted — remove copyToClipboard
│   │   ├── i18n/
│   │   │   ├── en.ts                       # Copied from web
│   │   │   └── vi.ts                       # Copied from web
│   │   └── constants/
│   │       ├── colors.ts                   # Brand palette
│   │       └── layout.ts                   # Spacing, radius, fontSize tokens
│   │
│   ├── state/                              # Top-level — Zustand is intentionally global
│   │   ├── index.ts                        # AsyncStorage persist
│   │   ├── types.ts
│   │   └── slices/
│   │       ├── userSlice.ts                # + firebaseUid field
│   │       ├── logSlice.ts
│   │       ├── recipeSlice.ts
│   │       ├── generatorSlice.ts
│   │       ├── uiSlice.ts
│   │       ├── languageSlice.ts
│   │       └── weightSlice.ts
│   │
│   └── firebase/                           # Top-level — not owned by any single feature
│       ├── config.ts                       # App init, auth, db exports
│       ├── auth.ts                         # signIn, signUp, signOut, googleSignIn
│       └── firestore.ts                    # saveUserData, loadUserData
│
├── assets/
│   ├── icon.png                            # 1024×1024 no alpha
│   ├── splash.png
│   └── images/                             # hero, meal type images
│
├── app.config.ts                           # Dynamic config (reads .env)
├── app.json                                # Static: orientation, userInterfaceStyle
├── eas.json                                # development / preview / production profiles
├── babel.config.js                         # NativeWind plugin + Reanimated (must be last)
├── metro.config.js                         # NativeWind metro plugin
├── global.css                              # @tailwind base/components/utilities
├── tailwind.config.js
├── tsconfig.json                           # @/ alias → ./src/
├── .env                                    # NEVER commit — Firebase + Anthropic keys
├── .env.example                            # Template with empty values
└── .gitignore
```

### Import path convention

```ts
// Feature-internal imports — relative
import { FilterChip } from './FilterChip'

// Cross-feature or shared — always use @/ alias
import { Button } from '@/shared/components/ui/Button'
import { useT } from '@/shared/hooks/useT'
import { useStore } from '@/state'
import { Colors } from '@/shared/constants/colors'

// Features NEVER import from other features directly
// ❌ import { MealCard } from '@/features/dashboard/components/MealCard'
// ✅ Move MealCard to @/shared/components/ if nutrition feature needs it too
```

---

## 10. Phase-by-Phase Build Plan

### Phase 1 — Project Scaffold + Firebase Auth
**Goal:** App runs, auth works, tab shell visible after login.
**Codex handles:** All file creation from the Codex prompt in `CODEX_PHASE1_PROMPT.md`.
**Claude Code reviews:** firebase/config.ts, state/index.ts, app/_layout.tsx auth guard.

Files created:
- All config files (babel, metro, tailwind, tsconfig, app.config.ts, eas.json)
- `src/types/`, `src/state/`, `src/lib/`, `src/i18n/`, `src/hooks/useT.ts`
- `src/firebase/config.ts`, `auth.ts`, `firestore.ts`
- `src/hooks/useAuth.ts`
- `app/_layout.tsx` (root auth guard)
- `app/(auth)/login.tsx`, `register.tsx`
- `app/(tabs)/_layout.tsx` (tab shell with placeholder screens)
- `src/constants/colors.ts`, `layout.ts`
- `src/services/claude.ts`, `openFoodFacts.ts`

Done when: `npx expo start --dev-client` runs, login screen appears, login works,
tab bar shows Dashboard placeholder after successful auth.

---

### Phase 2 — Onboarding + Dashboard
**Goal:** Full onboarding flow + working Dashboard with real data.

Files:
- `app/onboarding/index.tsx` — 4-step stepper (Stepper component)
- `src/components/ui/Button.tsx`, `Card.tsx`, `Badge.tsx`, `Separator.tsx`
- `src/components/layout/ScreenWrapper.tsx`
- `src/components/dashboard/CalorieRing.tsx` — SVG ring, props: `consumed`, `total`
- `src/components/dashboard/MacroBar.tsx` — animated bar, props: `value`, `total`, `color`, `label`
- `src/components/dashboard/MealCard.tsx` — meal row with swipe-to-delete
- `app/(tabs)/index.tsx` — full Dashboard implementation

Onboarding steps:
1. Name, gender, age, weight (kg), height (cm) — KeyboardAvoidingView
2. Goal: lose / gain / maintain — card selection
3. Activity: sedentary / light / moderate / active — card selection
4. Calculated targets preview + "Start Fueling" — calls `calculateMacroTargets`, saves to store, sets `onboardingComplete: true`, syncs to Firestore

Dashboard layout:
- Greeting (time-of-day: morning/afternoon/evening)
- `CalorieRing` — remaining vs target calories
- 4× `MacroBar` (protein, carbs, fat, calories)
- "Today's Meals" section with `MealCard` list
- "Generate Recipe" CTA card

Done when: New user goes through onboarding → sees dashboard with ring and bars.

---

### Phase 3 — Generator + Recipe Result
**Goal:** User can generate a recipe with Claude AI and view it.

Files:
- `src/components/generator/IngredientInput.tsx` — tag chip input with keyboard toolbar Done button
- `src/components/generator/FilterChip.tsx` — pressable chip for filters
- `app/(tabs)/generate.tsx` — full Generator screen
- `app/recipe/[id].tsx` — Recipe Result screen
- `src/hooks/useGenerator.ts` — adapted (useRouter replaces useNavigate)

Generator screen sections:
1. Remaining macros summary card
2. Ingredient input with chip tags
3. Meal type horizontal scroll (breakfast/lunch/dinner/snack)
4. Dietary filters multiselect chips
5. Cuisine picker chips
6. Meal size cards (light 25% / medium 40% / full 60%)
7. "Generate Recipe" CTA with loading state

Recipe Result screen:
- Back button → `router.back()`
- Header: title, cuisine, cook time, servings, MacroFit score badge
- Macro row: 4 nutrition values
- Ingredients list with amounts
- Numbered steps
- Footer: "Log This Meal" | "Save Recipe" / "Saved ✓" | "Try Another"
- `expo-haptics` on save and log actions

API key check: before calling `generateRecipe`, check `SecureStore.getItemAsync('ANTHROPIC_API_KEY')`.
If null, show a modal to enter and save the key first.

Done when: User can enter ingredients, press generate, see a recipe, and log it.
Dashboard macro bars update after logging.

---

### Phase 4 — Saved + History
**Goal:** Recipe collection and meal log history working.

Files:
- `app/(tabs)/saved.tsx` — Saved recipes screen
- `app/(tabs)/history.tsx` — History screen
- `src/components/history/DayCard.tsx` — expandable day row

Saved screen:
- Meal type filter tabs: All / Breakfast / Lunch / Dinner / Snack
- Recipe cards in FlatList (title, cuisine, macro summary, view button)
- Swipe-to-delete with confirmation alert
- Empty state with "Generate a Recipe" CTA

History screen:
- Date-grouped SectionList (most recent first)
- Each day shows: date, meal count, total calories
- Expandable `DayCard` shows individual meals with nutrition
- Filter chips: 7D / 30D / 90D / All
- Empty state

Done when: Saved recipes appear, history shows past days.

---

### Phase 5 — Progress Screen
**Goal:** Weight tracking with chart and milestones.

Files:
- `app/(tabs)/progress.tsx` — Progress screen
- `src/components/progress/WeightChart.tsx` — Victory Native line chart
- `src/components/progress/WeightModal.tsx` — bottom sheet (weight input + note)
- `src/components/progress/MilestonesGrid.tsx` — badge grid
- `src/components/progress/WeightHistory.tsx` — weight log list
- `src/hooks/useProgressStats.ts` — adapted (lucide-react-native icons)

Progress screen layout:
- Current weight card + goal weight card (tap to edit)
- Distance-to-goal progress bar
- `WeightChart` with filter buttons (7D / 30D / All)
- "+ Log Weight" floating button → opens `WeightModal`
- `MilestonesGrid` — badges earned/locked with category filter
- `WeightHistory` scrollable list with delete

WeightChart props: `data: {date: string, weight: number}[]`, `yDomain: [number, number]`
Uses Victory Native `VictoryLine` + `VictoryScatter` + `VictoryAxis` on Skia canvas.

Done when: User can log weight, see it on the chart, earn milestones.

---

### Phase 6 — Settings + Food Search Modal
**Goal:** Profile editing and direct food logging.

Files:
- `app/settings.tsx` — Settings screen
- `src/components/` food search modal (bottom sheet)

Settings screen:
- Personal info: name, gender, age, weight, height
- Goal selector (lose/gain/maintain)
- Activity level selector
- Language toggle EN / VI
- API key input (shows masked, tap to edit → SecureStore update)
- "Save Changes" → recalculates macros via `calculateMacroTargets`, syncs Firestore
- "Sign Out" button → `signOut()` → redirect to `/(auth)/login`

Food Search Modal:
- Triggered by "Add Meal" / "Log Food" button on Dashboard
- Bottom sheet with search TextInput
- OFF API results in FlatList (debounced 500ms)
- Per-result: name, per100g macros, gram input, "Log" button
- On log: calculate nutrition for entered grams, call `logMeal()`

Done when: All screens functional. Full app loop works end-to-end.

---

### Phase 7 — Polish + Animations
**Goal:** Production-quality feel.

- Page transition animations: `react-native-reanimated` entering/exiting for screens
- Haptic feedback: `expo-haptics.ImpactFeedbackStyle.Light` on all primary CTAs
- Skeleton loaders for loading states (Generator waiting, food search loading)
- Pull-to-refresh on Dashboard and History
- Keyboard dismissal on tap outside inputs
- All empty states designed and implemented
- Error boundaries on API-heavy screens

---

### Phase 8 — App Store Submission
**Goal:** Live on TestFlight, submitted for App Store review.

Checklist:
- [ ] `eas build --platform ios --profile production` succeeds
- [ ] App runs correctly on physical iPhone (not just simulator)
- [ ] 1024×1024 app icon (no alpha, no rounded corners)
- [ ] Splash screen configured
- [ ] Screenshots: 6.7" iPhone (1290×2796) — minimum 3
- [ ] Bundle ID: `com.namle.fuelwise` registered in Apple Developer portal
- [ ] Privacy policy URL (host on GitHub Pages: `namle.github.io/fuelwise-privacy`)
- [ ] App Store Connect metadata complete (name, subtitle, description, keywords)
- [ ] Category: Health & Fitness | Age rating: 4+
- [ ] `eas submit --platform ios`
- [ ] TestFlight internal testing
- [ ] App Store review submission

---

## 11. Testing Plan

### Unit Tests (Jest + `@testing-library/react-native`)
- `src/lib/tdee.ts` — all gender × activity × goal combinations (12 cases)
- `src/lib/claude.ts` — `scaleMacros()`, JSON parse with dirty input (markdown wrapping)
- `src/state/slices/logSlice.ts` — `logMeal`, `deleteLoggedMeal`, `getRemainingMacros`, `resetDailyLog`
- `src/state/slices/weightSlice.ts` — `logWeight`, `deleteWeight`
- `src/hooks/useProgressStats.ts` — milestone unlock conditions

### Manual QA Checklist
- [ ] Cold launch fresh install → onboarding flow → dashboard
- [ ] Return launch → skip onboarding → dashboard with persisted data
- [ ] Daily log reset at midnight (test by mocking date)
- [ ] Full generate loop: add ingredients → generate → view recipe → log meal → dashboard updates
- [ ] Food search: search "chicken" → results appear → log 200g → dashboard updates
- [ ] Save recipe → appears in Saved tab → delete works
- [ ] Log 3 weight entries → chart shows all 3 → weekly change updates
- [ ] Milestones unlock when conditions met
- [ ] Language toggle: EN → VI, all strings switch including AI response
- [ ] Settings save → macro targets recalculate → dashboard ring updates
- [ ] Sign out → redirected to login → sign back in → data restored from Firestore
- [ ] iPhone SE (small screen) — no overflow, no cut-off inputs
- [ ] iPhone 16 Pro Max (large screen) — no excessive empty space
- [ ] Keyboard does not cover inputs on any form

---

## 12. Claude Code + Codex Collaboration Protocol

### Who Does What

| Task | Tool |
|---|---|
| Architecture decisions, API integration, auth flow | Claude Code |
| State store changes (all slice files) | Claude Code only |
| Complex hook logic (useGenerator, useProgressStats) | Claude Code |
| Debugging layout, animation, or auth issues | Claude Code |
| Code review of Codex output | Claude Code |
| Scaffolding new screen files | Codex |
| Building repetitive UI components (Button, Badge, Card) | Codex |
| Writing translation file additions | Codex |
| Unit test boilerplate | Codex |

### Workflow Per Feature

```
1. Claude Code: define component interface + props type
2. Codex:       scaffold the component from that interface
3. Claude Code: review Codex output for correctness
4. You:         test on device
5. Claude Code: fix specific issues found on device
```

### Rules

- Codex never touches: `src/state/`, `src/firebase/`, `app/_layout.tsx`
- Codex always receives: the Props interface and one reference component before generating
- Always `git commit` before a Codex session so `git diff` shows exactly what changed
- Claude Code reviews the diff before merging Codex work to main

### When Starting a New Claude Code Session

Say: "Read CLAUDE.md first" — this file gives full context.
Then state: which phase you're on and what specific file/issue to work on.

---

## 13. Key Business Logic Reference

### TDEE Calculation
```
BMR (male)   = 10w + 6.25h - 5a + 5
BMR (female) = 10w + 6.25h - 5a - 161
TDEE         = BMR × activityMultiplier
calories     = TDEE + goalAdjustment
protein      = 2 × weight (kg)        → grams
fat          = (calories × 0.25) / 9  → grams
carbs        = (calories - protein×4 - fat×9) / 4

activityMultipliers: { sedentary:1.2, light:1.375, moderate:1.55, active:1.725 }
goalAdjustments:     { lose:-500, gain:+300, maintain:0 }
```

### Remaining Macros
```
remaining = macroTargets - dailyLog.totals
            (floor at 0 for each macro)
```

### Meal Size → Macro %
```
light: 25% of remaining
medium: 40% of remaining
full: 60% of remaining
```

### MacroFitScore Formula
```
100 minus the average percentage deviation across all 4 macros
Higher = closer match to targets
Range: 0–100 integer
```

### Daily Log Reset Trigger
Checked on every app foreground: if `dailyLog.date !== today()`, archive to `logHistory` and reset.

---

## 14. i18n Structure Reference

The translation object shape (both `en` and `vi` export the same structure):
```
en.brand.tagline
en.nav.{ dashboard, generate, saved, settings, goal, cook, dash, progress }
en.common.{ calories, protein, carbs, fat, cancel, delete, back, ... }
en.dashboard.{ greeting(name), goodMorning, remaining, todayMeals, ... }
en.generator.{ title, ingredientPlaceholder, dietaryOptions[], cuisineOptions[], ... }
en.foodSearch.{ title, placeholder, searching, noResults, logBtn, ... }
en.result.{ backToGenerator, macroFit, ingredients, instructions, logMeal, saveRecipe, ... }
en.saved.{ collection, title, count(n), emptyAll, view, confirmDelete, ... }
en.progress.{ title, currentWeight, target, logWeight, milestones, ... }
en.history.{ title, subtitle, filters, noHistory, ... }
en.settings.{ title, personalInfo, gender, goalSection, activity, goals, ... }
en.onboarding.{ step, step1Title, fullName, continueBtn, lose, gain, maintain, ... }
```

Access via `useT()` hook which reads `language` from store and returns the right object.

---

## 15. Known Constraints and Gotchas

1. **NativeWind v4 + Tailwind v3**: Do NOT upgrade tailwindcss to v4 — NativeWind v4 only supports Tailwind v3
2. **Reanimated plugin position**: Must be the LAST plugin in babel.config.js
3. **Victory Native requires Skia**: `@shopify/react-native-skia` must be installed alongside `victory-native`
4. **Firebase double-init**: Always guard with `if (!getApps().length)` before `initializeApp`
5. **expo-auth-session Google**: Requires `scheme` in app.config.ts for the redirect URI to work
6. **CalorieRing**: Cannot use CSS `stroke-dashoffset` in RN — must use `react-native-svg` `<Circle>` with `strokeDasharray` and `strokeDashoffset` props
7. **Keyboard avoiding**: Use `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` on all form screens
8. **AsyncStorage is async**: Zustand persist with AsyncStorage means the store may be empty on first render — add a `hasHydrated` flag to `uiSlice` and gate navigation on it
9. **Firestore offline**: Enable offline persistence with `enableIndexedDbPersistence` (web) or it's automatic in RN Firebase SDK
10. **Open Food Facts rate limit**: No auth required, but cap requests with 500ms debounce. Vietnamese food data is limited — consider seeding 10–20 common Vietnamese dishes as local fallback data
