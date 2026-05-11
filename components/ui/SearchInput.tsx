'use client'

import React, { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
}

/**
 * Search Input Component - Amélia Saúde Design System
 * Glass-style input with debounced search
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, debounceMs = 300, className, placeholder = 'Buscar notícias...', ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setLocalValue(newValue)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          onChange(newValue)
        }, debounceMs)
      },
      [onChange, debounceMs]
    )

    const handleClear = useCallback(() => {
      setLocalValue('')
      onChange('')
    }, [onChange])

    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum/60 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-10 py-3',
            'bg-white/5 border border-white/10 rounded-premium',
            'text-white placeholder:text-platinum/40',
            'transition-all duration-300',
            'focus:outline-none focus:border-gold-signature/50 focus:bg-white/10',
            'focus:ring-2 focus:ring-gold-signature/20'
          )}
          {...props}
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'p-1 rounded-full',
              'text-platinum/60 hover:text-white hover:bg-white/10',
              'transition-all duration-200'
            )}
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
