import { NavLink } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

const links = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/media', label: 'Media', icon: 'Image' },
  { to: '/clips', label: 'Clips', icon: 'Video' },
  { to: '/clips/generate', label: 'Generate Clip', icon: 'Sparkles' },
  { to: '/shared', label: 'Shared Albums', icon: 'Share2' },
];

const icons: Record<string, string> = {
  LayoutDashboard: '📊',
  Image: '🖼️',
  Video: '🎬',
  Sparkles: '✨',
  Share2: '🔗',
};

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useAuth();
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex-col z-40">
      <div className="flex items-center gap-3 px-5 pt-6 pb-6">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}>
          A
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: '#2c2416' }}>Archive</p>
        </div>
      </div>

      <div className="px-4 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}>
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: '#2c2416' }}>{user?.fullName || 'User'}</p>
            <p className="text-[11px] truncate" style={{ color: '#8a7d68' }}>{user?.emailAddresses?.[0]?.emailAddress || ''}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="shrink-0 text-xs px-2.5 py-1.5 rounded-md font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1 overflow-y-auto">
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
    </aside>
)};
