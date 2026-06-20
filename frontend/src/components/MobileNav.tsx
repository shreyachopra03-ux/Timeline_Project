import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: '📊' },
  { to: '/media', label: 'Media', icon: '🖼️' },
  { to: '/clips', label: 'Clips', icon: '🎬' },
  { to: '/shared', label: 'Shared', icon: '🔗' },
]

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40">
      <div className="flex items-center justify-around py-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'text-sidebar-accent-foreground bg-sidebar-accent'
                  : 'text-muted-foreground hover:text-sidebar-foreground'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
