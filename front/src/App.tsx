import { useEffect, useState } from 'react'
import { MessagesSquare, BookOpen, Github, BotMessageSquare, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ChatView from '@/views/ChatView'
import AgentView from '@/views/AgentView'
import RagView from '@/views/RagView'

type ViewKey = 'chat' | 'agent' | 'rag'

const NAV: { key: ViewKey; label: string; desc: string; icon: typeof MessagesSquare }[] = [
  { key: 'chat', label: '对话', desc: '与 Chun AI 自由交谈', icon: MessagesSquare },
  { key: 'agent', label: 'AI 智能助手', desc: '复杂任务自动规划与执行', icon: BotMessageSquare },
  { key: 'rag', label: '知识库', desc: '上传文档,基于内容问答', icon: BookOpen },
]

export default function App() {
  const [view, setView] = useState<ViewKey>('chat')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const current = NAV.find((n) => n.key === view)!

  // 切换视图后自动关闭移动端抽屉
  useEffect(() => {
    setDrawerOpen(false)
  }, [view])

  // 抽屉打开时锁定 body 滚动
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden">
      {/* 桌面侧栏 */}
      <DesktopSidebar view={view} setView={setView} />

      {/* 移动端抽屉(覆盖式) */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} view={view} setView={setView} />

      {/* 主区域 */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        <header
          className="h-14 px-3 sm:px-6 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-canvas)]/75 backdrop-blur-md"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="打开菜单"
              className="md:hidden w-10 h-10 -ml-1 grid place-items-center rounded-lg text-[var(--color-ink-soft)] active:bg-[var(--color-surface-2)]"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
            <current.icon size={16} strokeWidth={1.75} className="text-[var(--color-brand)] shrink-0" />
            <h1 className="font-serif text-[15px] font-semibold text-[var(--color-ink)] truncate">{current.label}</h1>
            <span className="text-xs text-[var(--color-ink-mute)] hidden sm:inline truncate">· {current.desc}</span>
          </div>
        </header>

        <section className="flex-1 overflow-hidden">
          {view === 'chat' && <ChatView />}
          {view === 'agent' && <AgentView />}
          {view === 'rag' && <RagView />}
        </section>
      </main>
    </div>
  )
}

function DesktopSidebar({ view, setView }: { view: ViewKey; setView: (v: ViewKey) => void }) {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface-2)]/40 backdrop-blur-sm">
      <SidebarContent view={view} setView={setView} />
    </aside>
  )
}

function MobileDrawer({
  open,
  onClose,
  view,
  setView,
}: {
  open: boolean
  onClose: () => void
  view: ViewKey
  setView: (v: ViewKey) => void
}) {
  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />
      {/* 抽屉 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="导航菜单"
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] bg-[var(--color-canvas)] border-r border-[var(--color-line)] shadow-[var(--shadow-pop)] flex flex-col transition-transform duration-250 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          onClick={onClose}
          aria-label="关闭菜单"
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)]"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
        <SidebarContent view={view} setView={setView} />
      </aside>
    </>
  )
}

function SidebarContent({ view, setView }: { view: ViewKey; setView: (v: ViewKey) => void }) {
  return (
    <>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] text-white grid place-items-center font-serif text-lg shadow-sm">
            纯
          </div>
          <div className="leading-tight">
            <div className="font-serif font-semibold text-[15px] text-[var(--color-ink)]">Chun AI</div>
            <div className="text-[11px] text-[var(--color-ink-mute)]">智能助手 · v0.1</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = item.key === view
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all duration-150 min-h-[48px]',
                active
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-soft)] border border-[var(--color-line)]'
                  : 'text-[var(--color-ink-soft)] active:bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]/60 border border-transparent',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 shrink-0 transition-colors',
                  active ? 'text-[var(--color-brand)]' : 'text-[var(--color-ink-mute)]',
                )}
                size={18}
                strokeWidth={1.75}
              />
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium">{item.label}</div>
                <div className="text-[11px] text-[var(--color-ink-mute)] truncate">{item.desc}</div>
              </div>
            </button>
          )
        })}
      </nav>

      <div
        className="px-4 py-4 border-t border-[var(--color-line)]"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)] transition-colors"
        >
          <Github size={14} strokeWidth={1.75} />
          <span>由 Spring AI + React 构建</span>
        </a>
      </div>
    </>
  )
}
