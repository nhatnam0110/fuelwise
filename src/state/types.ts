import type { UserSlice } from './slices/userSlice'
import type { LogSlice } from './slices/logSlice'
import type { RecipeSlice } from './slices/recipeSlice'
import type { GeneratorSlice } from './slices/generatorSlice'
import type { UiSlice } from './slices/uiSlice'
import type { LanguageSlice } from './slices/languageSlice'
import type { WeightSlice } from './slices/weightSlice'

export type AppStore =
  UserSlice &
  LogSlice &
  RecipeSlice &
  GeneratorSlice &
  UiSlice &
  LanguageSlice &
  WeightSlice
