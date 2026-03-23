import { useStore } from '@/store'
import { en } from '@/i18n/en'
import { vi } from '@/i18n/vi'

export function useT() {
  const language = useStore((s) => s.language)
  return language === 'vi' ? vi : en
}
