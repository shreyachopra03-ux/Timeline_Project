import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import FilmstripFooter from './FilmstripFooter'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-60 pb-20 lg:pb-0">
        {children}
      </main>
      <MobileNav />
      <FilmstripFooter years={[]} />
    </div>
  )};
