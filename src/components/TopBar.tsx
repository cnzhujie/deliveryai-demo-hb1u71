import { Accessibility, Crown, Languages, LayoutDashboard, MapPin, Menu as MenuIcon, Moon, MoreHorizontal, PhoneCall, ReceiptText, Search, Sun, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { tableAreas } from '@/data/menu'
import { cn } from '@/lib/utils'
import type { ViewName } from '@/types'

interface TopBarProps {
  table: string
  view: ViewName
  serviceCount: number
  language: string
  elderly: boolean
  dark: boolean
  onToggleLanguage: () => void
  onToggleElderly: () => void
  onToggleDark: () => void
  onView: (view: ViewName) => void
  onService: () => void
  onConsole: () => void
}

// 会员弹窗内容
function MemberContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal-900 to-charcoal-700 p-5 text-white shadow-card">
        <div className="flex items-start justify-between"><span className="rounded-xl bg-amber-400 p-2 text-charcoal-900"><Crown /></span><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{t('common.member_badge')}</span></div>
        <p className="mt-6 text-sm text-rice-200">{t('common.member_name')}</p><p className="mt-1 text-2xl font-bold">2,680 <small className="text-sm font-medium text-rice-200">{t('common.growth_value')}</small></p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs text-charcoal-500">{t('common.queue')}</p><p className="mt-2 text-2xl font-extrabold text-charcoal-900">A018</p><p className="text-xs text-chili-500">{t('common.queue_ahead')}</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs text-charcoal-500">{t('common.benefits')}</p><p className="mt-2 text-2xl font-extrabold text-charcoal-900">4 <small className="text-sm">{t('common.tickets')}</small></p><p className="text-xs text-amber-500">{t('common.coupon')}</p></div>
      </div>
    </>
  )
}

export function TopBar({ table, view, serviceCount, language, elderly, dark, onToggleLanguage, onToggleElderly, onToggleDark, onView, onService, onConsole }: TopBarProps) {
  const { t } = useTranslation()
  const [moreOpen, setMoreOpen] = useState(false)
  const [memberOpen, setMemberOpen] = useState(false)
  const areaKey = tableAreas[table]
  const tableLabel = areaKey ? `${table} · ${t(areaKey)}` : table

  return (
    <>
      <div className="safe-top bg-charcoal-900 px-4 py-2 text-center text-xs font-semibold tracking-wide text-rice-100">
        {t('common.banner')}
      </div>
      <header className="sticky top-0 z-30 border-b border-charcoal-900/5 bg-rice-50/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 lg:px-6 sm:gap-3">
          <button onClick={() => onView('menu')} className="flex items-center gap-2 text-left size-icon" aria-label={t('common.brand_name')}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-chili-500 text-lg font-black text-white shadow-md">{t('common.brand')}</span>
            <span className="hidden sm:block"><strong className="block leading-4 text-charcoal-900">{t('common.brand_name')}</strong><small className="text-charcoal-500">{t('common.subtitle')}</small></span>
          </button>
          <span className="ml-1 flex shrink-0 items-center gap-1 rounded-full bg-rice-200 px-2.5 py-2 text-xs font-bold text-charcoal-700 sm:px-3">
            <MapPin size={13} className="text-chili-500 shrink-0" />
            <span className="max-w-[80px] truncate sm:max-w-none">{tableLabel}</span>
          </span>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            <Button variant={view === 'menu' ? 'secondary' : 'ghost'} size="sm" onClick={() => onView('menu')}><Search size={16} />{t('common.nav_menu')}</Button>
            <Button variant={view === 'order' ? 'secondary' : 'ghost'} size="sm" onClick={() => onView('order')}><ReceiptText size={16} />{t('common.nav_order')}</Button>
          </nav>
          <Button variant="outline" size="icon" onClick={onService} className="relative shrink-0" aria-label={t('common.aria_service')}>
            <PhoneCall size={18} />{serviceCount > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-chili-500" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleLanguage} aria-label={t('common.aria_lang')} className="shrink-0 px-2.5 sm:px-3">
            <Languages size={16} className="sm:mr-1" /><span className="hidden sm:inline">{language === 'zh' ? 'EN' : '中'}</span>
          </Button>
          <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
            <DialogTrigger asChild><Button variant="outline" size="icon" aria-label={t('common.aria_member')} className="shrink-0 hidden sm:flex"><UserRound size={18} /></Button></DialogTrigger>
            <DialogContent title={t('common.member_title')}>
              <MemberContent t={t} />
            </DialogContent>
          </Dialog>
          {/* 窄屏下收纳到更多菜单 */}
          <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0" aria-label="更多选项">
                <MoreHorizontal size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent title="更多选项">
              <div className="mt-2 space-y-2">
                <button onClick={() => { onToggleDark(); setMoreOpen(false) }} className={cn("flex w-full items-center gap-3 rounded-2xl p-4 text-left transition active:scale-98", dark ? 'bg-chili-50 text-chili-600' : 'bg-white text-charcoal-700')}>
                  {dark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                  <div><p className="font-bold">{dark ? '日间模式' : t('common.dark_mode_on')}</p></div>
                </button>
                <button onClick={() => { onToggleElderly(); setMoreOpen(false) }} className={cn("flex w-full items-center gap-3 rounded-2xl p-4 text-left transition active:scale-98", elderly ? 'bg-chili-50 text-chili-600' : 'bg-white text-charcoal-700')}>
                  <Accessibility size={20} className={elderly ? 'text-chili-500' : ''} />
                  <div><p className="font-bold">{elderly ? '切换至常规模式' : '切换至老人模式'}</p></div>
                </button>
                <button onClick={() => { onConsole(); setMoreOpen(false) }} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left text-charcoal-700 transition active:scale-98">
                  <LayoutDashboard size={20} />
                  <div><p className="font-bold">{t('common.nav_demo')}</p></div>
                </button>
                <button onClick={() => { setMoreOpen(false); setMemberOpen(true) }} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left text-charcoal-700 transition active:scale-98">
                  <UserRound size={20} />
                  <div><p className="font-bold">{t('common.member_title')}</p></div>
                </button>
              </div>
            </DialogContent>
          </Dialog>
          {/* 大屏显示完整按钮 */}
          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="outline" size="icon" onClick={onConsole} aria-label={t('common.aria_console')}><LayoutDashboard size={18} /></Button>
            <Button variant="outline" size="icon" onClick={onToggleDark} aria-label={dark ? t('common.aria_light') : t('common.aria_dark')}>
              {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </Button>
            <Button variant="outline" size="icon" onClick={onToggleElderly} aria-label={elderly ? '切换至常规模式' : '切换至老人模式'}>
              <Accessibility size={18} className={elderly ? 'text-chili-500' : ''} />
            </Button>
          </div>
        </div>
        {/* 移动端页面切换导航（仅在菜单/订单页显示） */}
        <div className="flex gap-1 border-t border-charcoal-900/5 px-4 py-2 md:hidden">
          <button onClick={() => onView('menu')} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition active:scale-98", view === 'menu' ? 'bg-chili-50 text-chili-500' : 'text-charcoal-500')}>
            <MenuIcon size={18} />{t('common.nav_menu')}
          </button>
          <button onClick={() => onView('order')} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition active:scale-98", view === 'order' ? 'bg-chili-50 text-chili-500' : 'text-charcoal-500')}>
            <ReceiptText size={18} />{t('common.nav_order')}
          </button>
        </div>
      </header>
    </>
  )
}
