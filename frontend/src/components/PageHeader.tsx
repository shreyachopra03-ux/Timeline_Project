interface Props {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
};

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
      style={{
        backgroundColor: 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(44, 36, 22, 0.08)',
      }}
    >
      <div>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: '#8a7d68' }}>{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-medium px-4 py-2 rounded-full transition-all"
          style={{ backgroundColor: '#2c2416', color: '#fefcf7' }}
        >
          {action.label}
        </button>
      )}
    </header>
)};
