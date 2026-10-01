import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Ensina ao tailwind-merge as escalas próprias do design system (theme.css), para que
// text-md (tamanho) e text-text-muted (cor) não se anulem.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      radius: ['control', 'card'],
      shadow: ['card', 'modal'],
      color: [
        'bg',
        'surface',
        'surface-muted',
        'border',
        'border-strong',
        'text',
        'text-muted',
        'text-inverse',
        'action-primary',
        'action-primary-hover',
        'action-primary-text',
        'disabled-bg',
        'disabled-text',
        'success',
        'success-bg',
        'success-border',
        'error',
        'error-bg',
        'error-border',
        'warning',
        'warning-bg',
        'warning-border',
        'focus-ring',
        'overlay',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
