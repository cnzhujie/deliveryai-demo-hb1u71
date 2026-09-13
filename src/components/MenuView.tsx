import { useMemo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Flame, ImageOff, Plus, Search, Sparkles, Users } from 'lucide-react'
import { categories, products } from '@/data/menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn, money } from '@/lib/utils'
import type { CartItem, Product } from '@/types'

interface MenuViewProps {
  diners: string[]
  soldOut: string[]
  onAdd: (item: CartItem) => void
}

// 图片组件：懒加载+淡入+错误处理
function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    if (img.complete && img.naturalHeight > 0) {
      setLoaded(true)
    }
  }, [src])

  if (error) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center bg-rice-200 text-charcoal-500", className)}>
        <ImageOff size={32} className="opacity-50" />
        <span className="mt-2 text-xs font-medium">{alt}</span>
      </div>
    )
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("img-fadein h-full w-full object-cover transition duration-500", loaded && 'loaded', className)}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  )
}

export function MenuView({ diners, soldOut, onAdd }: MenuViewProps) {
  const { t } = useTranslation()
  const [category, setCategory] = useState('menu.cat.recommend')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [portion, setPortion] = useState('')
  const [flavor, setFlavor] = useState('')
  const [spicy, setSpicy] = useState('')
  const [showRiskWarning, setShowRiskWarning] = useState(false)
  const [diner, setDiner] = useState(diners[0])

  useEffect(() => {
    setDiner(diners[0])
  }, [diners])

  const handleSpicyChange = (option: string) => {
    if (option === 'menu.option.super_spicy') {
      setShowRiskWarning(true)
    } else {
      setSpicy(option)
    }
  }

  const confirmSuperSpicy = () => {
    setSpicy('menu.option.super_spicy')
    setShowRiskWarning(false)
  }

  const cancelSuperSpicy = () => {
    setShowRiskWarning(false)
  }

  const visible = useMemo(() => products.filter((product) => {
    const matchCategory = category === 'menu.cat.recommend' || product.category === category
    const productName = t(product.name)
    const productDesc = t(product.description)
    const matchSearch = productName.includes(search) || productDesc.includes(search)
    return matchCategory && matchSearch
  }), [category, search, t])

  const openSpec = (product: Product) => {
    setSelected(product)
    setPortion(product.options?.portion?.[1] || product.options?.portion?.[0] || '')
    setFlavor(product.options?.flavor?.[0] || '')
    setSpicy(product.options?.spicy?.[0] || '')
  }

  const addSelected = () => {
    if (!selected) return
    const portionFactor = portion === 'menu.option.half' ? 0.58 : 1
    const specParts = [portion, flavor, spicy].filter(Boolean).map((key) => t(key))
    if (spicy === 'menu.option.super_spicy') {
      specParts.push(t('cart.confirmed_risk'))
    }
    const spec = specParts.join(' · ') || t('menu.standard')
    onAdd({ uid: crypto.randomUUID(), productId: selected.id, name: t(selected.name), price: Math.round(selected.price * portionFactor), quantity: 1, image: selected.image, spec, orderedBy: diner })
    setSelected(null)
  }

  return (
    <section className="min-w-0">
      <div className="relative overflow-hidden rounded-3xl bg-charcoal-900 p-5 text-white shadow-card sm:p-6">
        <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-chili-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div><span className="flex items-center gap-2 text-xs font-bold text-amber-400"><Sparkles size={14} />{t('menu.hero_badge')}</span><h1 className="mt-2 text-2xl font-extrabold sm:text-3xl md:text-4xl">{t('menu.hero_title')}</h1><p className="mt-2 text-sm text-rice-200">{t('menu.hero_diners', { count: diners.length })}</p></div>
          <div className="flex -space-x-2">{diners.map((name, index) => <span key={name} title={name} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-charcoal-900 text-xs font-bold ${index === 0 ? 'bg-chili-500' : index === 1 ? 'bg-amber-400 text-charcoal-900' : 'bg-rice-200 text-charcoal-900'}`}>{name.slice(0, 1)}</span>)}</div>
        </div>
      </div>

      <div className="sticky top-32 sm:top-36 z-20 -mx-3 mt-4 bg-rice-100/95 px-3 pb-3 backdrop-blur-xl sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('menu.search_placeholder')}
            className="h-12 w-full rounded-2xl border border-charcoal-900/5 bg-white pl-11 pr-4 text-base shadow-sm outline-none transition focus:border-chili-500/30 focus:ring-4 focus:ring-chili-50"
          />
        </div>
        <div className="scrollbar-none scroll-container mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 shrink-0",
                category === item ? 'bg-chili-500 text-white shadow-md' : 'bg-white text-charcoal-500 hover:text-chili-500'
              )}
            >
              {t(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 grid-cols-2 sm:gap-4">
        {visible.map((product, index) => {
          const unavailable = soldOut.includes(product.id)
          return (
            <article key={product.id} className="group animate-rise overflow-hidden rounded-3xl border border-charcoal-900/5 bg-white shadow-card transition active:scale-[0.98] hover:-translate-y-1" style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}>
              <div className="relative h-32 overflow-hidden sm:h-36 md:h-40">
                <LazyImage src={product.image} alt={t(product.name)} className={`transition duration-500 group-hover:scale-105 ${unavailable ? 'grayscale' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/45 to-transparent" />
                {product.badge && <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-charcoal-900">{t(product.badge)}</span>}
                {unavailable && <span className="absolute inset-0 flex items-center justify-center bg-white/55 text-base font-extrabold text-charcoal-900 backdrop-blur-sm sm:text-lg">{t('menu.sold_out')}</span>}
                {product.orderedCount && <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-chili-600"><Check size={12} />{t('menu.ordered_table', { count: product.orderedCount })}</span>}
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-charcoal-900 text-sm sm:text-base truncate">{t(product.name)}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-charcoal-500">{t(product.description)}</p>
                  </div>
                  <Button size="icon" disabled={unavailable} onClick={() => openSpec(product)} className="h-10 w-10 shrink-0 rounded-full active:scale-90">
                    <Plus size={18} />
                  </Button>
                </div>
                <p className="mt-3 text-lg font-extrabold text-chili-500 sm:text-xl">{money(product.price)} <small className="text-xs font-medium text-charcoal-500">{t('menu.from')}</small></p>
              </div>
            </article>
          )
        })}
      </div>

      {visible.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 py-12 text-center">
          <Search size={48} className="text-charcoal-300" />
          <p className="font-bold text-charcoal-700">{t('menu.no_result') || '未找到相关菜品'}</p>
          <button onClick={() => { setSearch(''); setCategory('menu.cat.recommend') }} className="text-chili-500 font-semibold underline">
            {t('menu.clear_search') || '清除搜索条件'}
          </button>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setShowRiskWarning(false) } }}>
        <DialogContent title={selected ? t(selected.name) : ''}>
          {selected && <>
            <div className="mt-2 flex gap-3 rounded-2xl bg-white p-3 sm:gap-4">
              <LazyImage src={selected.image} alt={t(selected.name)} className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6 text-charcoal-500 line-clamp-2">{t(selected.description)}</p>
                <p className="mt-2 text-lg font-extrabold text-chili-500 sm:text-xl">{money(selected.price)} <small className="text-xs font-medium text-charcoal-500">{t('menu.from')}</small></p>
              </div>
            </div>
            {selected.options?.portion && <OptionRow label={t('menu.select_portion')} options={selected.options.portion} value={portion} onChange={setPortion} t={t} />}
            {selected.options?.flavor && <OptionRow label={t('menu.select_flavor')} options={selected.options.flavor} value={flavor} onChange={setFlavor} t={t} />}
            {selected.options?.spicy && <OptionRow label={t('menu.select_spicy')} icon={<Flame size={15} className="text-chili-500" />} options={selected.options.spicy} value={spicy} onChange={handleSpicyChange} t={t} />}
            <div className="mt-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-charcoal-900"><Users size={16} />{t('menu.who_ordered')}</p>
              <div className="flex flex-wrap gap-2">{diners.map((name) => (
                <button key={name} onClick={() => setDiner(name)} className={`rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 ${diner === name ? 'bg-amber-400 text-charcoal-900' : 'bg-white text-charcoal-500'}`}>{name}</button>
              ))}</div>
            </div>
            <Button onClick={addSelected} className="mt-6 h-12 w-full text-base"><Plus size={17} />{t('menu.add_to_cart')}</Button>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={showRiskWarning} onOpenChange={(open) => !open && cancelSuperSpicy()}>
        <DialogContent title={t('menu.super_spicy_warning_title')}>
          <div className='mt-2 flex flex-col items-center gap-4 py-2'>
            <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-chili-50 text-chili-500'><AlertTriangle size={28} /></span>
            <p className='text-center text-sm leading-6 text-charcoal-700'>{t('menu.super_spicy_warning')}</p>
            <div className='flex w-full gap-3 pt-2'>
              <Button variant='outline' className='flex-1 h-12' onClick={cancelSuperSpicy}>{t('menu.super_spicy_cancel')}</Button>
              <Button className='flex-1 h-12' onClick={confirmSuperSpicy}>{t('menu.super_spicy_confirm')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

type TFunc = (key: string, options?: Record<string, unknown>) => string

function OptionRow({ label, icon, options, value, onChange, t }: { label: string; icon?: React.ReactNode; options: string[]; value: string; onChange: (value: string) => void; t: TFunc }) {
  return <div className="mt-4 sm:mt-5"><p className="mb-3 flex items-center gap-2 text-sm font-bold text-charcoal-900">{icon}{label}</p><div className="flex flex-wrap gap-2">{options.map((option) => <button key={option} onClick={() => onChange(option)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${value === option ? 'border-chili-500 bg-chili-50 text-chili-600' : 'border-charcoal-900/10 bg-white text-charcoal-500'}`}>{t(option)}</button>)}</div></div>
}
