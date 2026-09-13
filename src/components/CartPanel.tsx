import { useTranslation } from 'react-i18next'
import { Check, Minus, Plus, ShoppingBasket, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, money } from '@/lib/utils'
import type { CartItem } from '@/types'

interface CartPanelProps {
  items: CartItem[]
  compact?: boolean
  onQuantity: (uid: string, delta: number) => void
  onSubmit: () => void
}

export function CartPanel({ items, compact, onQuantity, onSubmit }: CartPanelProps) {
  const { t } = useTranslation()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const people = [...new Set(items.map((item) => item.orderedBy))]

  if (!items.length) {
    return (
      <section className="rounded-3xl border border-charcoal-900/5 bg-white p-6 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rice-100 text-chili-500"><ShoppingBasket size={26} /></span>
        <h3 className="mt-4 font-bold text-charcoal-900">{t('cart.empty_title')}</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-charcoal-500">{t('cart.empty_desc')}</p>
      </section>
    )
  }

  return (
    <section className={cn("rounded-3xl border border-charcoal-900/5 bg-white shadow-card", compact ? 'p-4' : 'p-5')}>
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-extrabold text-charcoal-900">{t('cart.title')}</h3><p className="mt-1 text-xs text-charcoal-500">{t('cart.item_count', { count: items.reduce((sum, item) => sum + item.quantity, 0) })}</p></div>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-charcoal-700"><Users size={13} />{t('cart.people', { count: people.length })}</span>
      </div>
      <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
        {items.map((item) => (
          <div key={item.uid} className="group flex gap-3 border-b border-charcoal-900/5 pb-3 last:border-0 sm:pb-4">
            <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2"><p className="truncate font-bold text-charcoal-900">{item.name}</p><strong className="shrink-0 text-sm text-chili-500">{money(item.price * item.quantity)}</strong></div>
              <p className="mt-1 truncate text-xs text-charcoal-500">{item.spec}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-500">{item.orderedBy.slice(0, 1)}</span>
                  {t('cart.ordered_by', { name: item.orderedBy })}
                </span>
                <div className="flex items-center gap-1 rounded-xl bg-rice-100 p-1.5">
                  <button
                    onClick={() => onQuantity(item.uid, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-charcoal-700 shadow-sm transition active:scale-90"
                    aria-label={t('common.aria_reduce')}
                  >
                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-charcoal-900">{item.quantity}</span>
                  <button
                    onClick={() => onQuantity(item.uid, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-chili-500 text-white transition active:scale-90"
                    aria-label={t('common.aria_increase')}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-rice-100 p-4 sm:mt-5">
        <div className="flex justify-between text-sm text-charcoal-500"><span>{t('cart.subtotal')}</span><span>{money(subtotal)}</span></div>
        <div className="mt-2 flex justify-between font-extrabold text-charcoal-900"><span>{t('cart.estimated')}</span><span className="text-xl text-chili-500">{money(subtotal)}</span></div>
      </div>
      <Button onClick={onSubmit} className="mt-4 h-12 w-full text-base"><Check size={17} />{compact ? t('cart.submit_new') : t('cart.submit')}</Button>
      <p className="mt-3 text-center text-xs text-charcoal-500">{t('cart.submit_hint')}</p>
    </section>
  )
}
