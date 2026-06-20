import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/media', label: 'Media', icon: 'Image' },
  { to: '/clips', label: 'Clips', icon: 'Video' },
  { to: '/clips/generate', label: 'Generate Clip', icon: 'Sparkles' },
  { to: '/shared', label: 'Shared Albums', icon: 'Share2' },
]

const icons: Record<string, string> = {
  LayoutDashboard: '📊',
  Image: '🖼️',
  Video: '🎬',
  Sparkles: '✨',
  Share2: '🔗',
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex-col z-40">
      <div className="flex items-center gap-3 px-5 pt-6 pb-8">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shadow-sm">
          T
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">TimelineApp</p>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Media Manager</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <span className="text-base">{icons[link.icon]}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
          <p className="text-xs text-muted-foreground">All systems nominal</p>
        </div>
      </div>
    </aside>
  )
}
