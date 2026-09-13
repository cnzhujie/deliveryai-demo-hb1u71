import { useEffect, useReducer, useState } from 'react'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { ClipboardList, ConciergeBell, LayoutDashboard, Menu as MenuIcon, ShoppingBasket } from 'lucide-react'
import { BindTable } from '@/components/BindTable'
import { WelcomeView } from '@/components/WelcomeView'
import { CartPanel } from '@/components/CartPanel'
import { CheckoutView } from '@/components/CheckoutView'
import { DemoConsole } from '@/components/DemoConsole'
import { MenuView } from '@/components/MenuView'
import { OrderView } from '@/components/OrderView'
import { ServiceSheet } from '@/components/ServiceSheet'
import { TopBar } from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useElderlyMode } from '@/hooks/useElderlyMode'
import { orderReducer, initialState } from '@/state/orderReducer'
import { products } from '@/data/menu'
import { money, cn } from '@/lib/utils'
import type { AppState, ViewName } from '@/types'

function createPreviewState(): AppState {
  const preview = new URLSearchParams(window.location.search).get('preview')
  if (preview !== 'menu') return initialState
  const product = products[2]
  const spec = [i18next.t('menu.option.full'), i18next.t('menu.option.original')].join(' · ')
  return {
    ...initialState,
    table: 'A08',
    view: 'menu',
    cart: [{ uid: 'preview-item', productId: product.id, name: i18next.t(product.name), price: product.price, quantity: 1, image: product.image, spec, orderedBy: '姚乾' }],
    lastMessage: initialState.lastMessage,
  }
}

// 键盘弹起检测Hook
function useKeyboardOpen() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    const handleResize = () => {
      const vh = vv.height
      const windowHeight = window.innerHeight
      // 视口高度小于窗口高度75%时认为键盘弹起
      setIsKeyboardOpen(vh < windowHeight * 0.75)
    }

    vv.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      vv.removeEventListener('resize', handleResize)
    }
  }, [])

  return isKeyboardOpen
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [state, dispatch] = useReducer(orderReducer, initialState, createPreviewState)
  const { enabled: elderly, toggle: toggleElderly } = useElderlyMode()
  const { enabled: dark, toggle: toggleDark } = useDarkMode()
  const [serviceOpen, setServiceOpen] = useState(false)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const keyboardOpen = useKeyboardOpen()
  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const waitingServices = state.services.filter((service) => service.status === 'waiting').length

  useEffect(() => {
    document.documentElement.lang = i18n.language === 'zh' ? 'zh-CN' : 'en'
    document.title = t('common.title')
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', t('common.meta_desc'))
    try {
      localStorage.setItem('i18nextLng', i18n.language)
    } catch {
      // localStorage 不可用时降级为内存态，不报错不阻塞
    }
  }, [i18n.language, t])

  useEffect(() => {
    if (keyboardOpen) {
      document.body.classList.add('keyboard-open')
    } else {
      document.body.classList.remove('keyboard-open')
    }
  }, [keyboardOpen])

  const changeView = (view: ViewName) => dispatch({ type: 'SET_VIEW', view })
  const submitOrder = () => {
    dispatch({ type: 'SUBMIT_ORDER' })
    setCartOpen(false)
  }
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
  }
  const handleToggleElderly = () => {
    toggleElderly()
    dispatch({ type: 'SET_MESSAGE', message: elderly ? '已切换为常规模式' : '已切换为老人模式' })
  }
  const handleToggleDark = () => {
    toggleDark()
    dispatch({ type: 'SET_MESSAGE', message: dark ? t('common.dark_mode_off') : t('common.dark_mode_on') })
  }

  if (state.view === 'bind' || !state.table) {
    return <BindTable onBind={(table) => dispatch({ type: 'BIND_TABLE', table })} />
  }

  if (state.view === 'welcome') {
    return <WelcomeView table={state.table!} onEnter={() => dispatch({ type: 'SET_VIEW', view: 'menu' })} />
  }

  return (
    <div className={cn("min-h-screen bg-rice-100 paper-noise", keyboardOpen && 'keyboard-open')}>
      <TopBar
        table={state.table}
        view={state.view}
        serviceCount={waitingServices}
        language={i18n.language}
        elderly={elderly}
        dark={dark}
        onToggleLanguage={toggleLanguage}
        onToggleElderly={handleToggleElderly}
        onToggleDark={handleToggleDark}
        onView={changeView}
        onService={() => setServiceOpen(true)}
        onConsole={() => setConsoleOpen(true)}
      />

      {state.view === 'menu' && (
        <main className="mx-auto grid max-w-7xl gap-6 px-3 py-4 pb-32 sm:px-4 sm:py-5 sm:pb-28 lg:grid-cols-3 lg:px-6 lg:py-7 lg:pb-8">
          <div className="lg:col-span-2">
            <MenuView diners={state.diners} soldOut={state.soldOut} onAdd={(item) => dispatch({ type: 'ADD_CART', item })} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <CartPanel items={state.cart} onQuantity={(uid, delta) => dispatch({ type: 'CHANGE_QTY', uid, delta })} onSubmit={submitOrder} />
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-100/70 p-4 text-sm text-charcoal-700">
                <p className="font-bold">{t('common.collab_title')}</p>
                <p className="mt-1 leading-6 text-charcoal-500">{t('common.collab_desc')}</p>
              </div>
            </div>
          </aside>
        </main>
      )}

      {state.view === 'order' && (
        <OrderView
          items={state.orderItems}
          stage={state.orderStage}
          onAddMore={() => changeView('menu')}
          onCancel={(uid) => dispatch({ type: 'REQUEST_CANCEL', uid })}
          onCheckout={() => changeView('checkout')}
        />
      )}

      {state.view === 'checkout' && (
        <CheckoutView items={state.orderItems} paid={state.paid} onPay={() => dispatch({ type: 'PAY' })} onBack={() => changeView('order')} />
      )}

      <ServiceSheet open={serviceOpen} requests={state.services} onOpenChange={setServiceOpen} onCall={(service) => dispatch({ type: 'CALL_SERVICE', service })} />
      <DemoConsole
        open={consoleOpen}
        table={state.table}
        stage={state.orderStage}
        soldOut={state.soldOut}
        services={state.services}
        onOpenChange={setConsoleOpen}
        onStage={(stage) => dispatch({ type: 'SET_STAGE', stage })}
        onSoldOut={(productId) => dispatch({ type: 'TOGGLE_SOLD_OUT', productId })}
        onRespond={() => dispatch({ type: 'RESPOND_SERVICES' })}
        onReset={() => { dispatch({ type: 'RESET' }); setConsoleOpen(false) }}
      />

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent title={t('cart.dialog_title')}>
          <div className="mt-2"><CartPanel compact items={state.cart} onQuantity={(uid, delta) => dispatch({ type: 'CHANGE_QTY', uid, delta })} onSubmit={submitOrder} /></div>
        </DialogContent>
      </Dialog>

      {/* 悬浮购物车 - 键盘弹起时隐藏 */}
      <div className={cn(
        "fixed left-1/2 z-30 -translate-x-1/2 transition-all duration-200 lg:hidden",
        state.view === 'menu' && state.cart.length > 0 && !keyboardOpen ? "bottom-20 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}>
        <Button onClick={() => setCartOpen(true)} className="h-12 rounded-full px-5 shadow-float text-base">
          <span className="relative"><ShoppingBasket size={19} /><span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs text-charcoal-900">{state.cart.length}</span></span>
          <span className="hidden xs:inline">{t('common.view_cart')} · {money(cartTotal)}</span>
          <span className="xs:hidden">{money(cartTotal)}</span>
        </Button>
      </div>

      {/* 底部Tab导航 - 键盘弹起时隐藏 */}
      <nav className={cn(
        "safe-bottom fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-charcoal-900/5 bg-white/95 px-2 pt-2 backdrop-blur-xl transition-all duration-200 lg:hidden hide-on-keyboard",
        keyboardOpen && "translate-y-full opacity-0"
      )}>
        <MobileNav active={state.view === 'menu'} icon={MenuIcon} label={t('common.nav_menu')} onClick={() => changeView('menu')} />
        <MobileNav active={state.view === 'order'} icon={ClipboardList} label={t('common.nav_order')} onClick={() => changeView('order')} />
        <MobileNav active={serviceOpen} icon={ConciergeBell} label={t('common.nav_service')} badge={waitingServices} onClick={() => setServiceOpen(true)} />
        <MobileNav active={consoleOpen} icon={LayoutDashboard} label={t('common.nav_demo')} onClick={() => setConsoleOpen(true)} />
      </nav>

      {/* Toast消息 */}
      <div className="pointer-events-none fixed left-1/2 top-24 z-40 -translate-x-1/2 rounded-full bg-charcoal-900/90 px-5 py-2.5 text-sm font-semibold text-white shadow-float safe-top animate-rise">
        {state.lastMessage}
      </div>
    </div>
  )
}

function MobileNav({ active, icon: Icon, label, badge, onClick }: { active: boolean; icon: typeof MenuIcon; label: string; badge?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition active:scale-95",
        active ? 'bg-chili-50 text-chili-500' : 'text-charcoal-500'
      )}
    >
      <Icon size={22} />
      <span className="truncate max-w-full px-1">{label}</span>
      {badge ? (
        <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-chili-500 px-1 text-xs text-white">
          {badge}
        </span>
      ) : null}
    </button>
  )
}
