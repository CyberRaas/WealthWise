'use client'

import { Search, X } from 'lucide-react'

/**
 * Reusable Search Input Component
 *
 * @param {object} props
 * @param {string} props.value - Current search value
 * @param {function} props.onChange - Change handler
 * @param {function} props.onSubmit - Submit handler (optional)
 * @param {function} props.onClear - Clear handler (optional)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  className = ''
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(value)
  }

  const handleClear = () => {
    onChange('')
    if (onClear) onClear()
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </form>
  )
}
