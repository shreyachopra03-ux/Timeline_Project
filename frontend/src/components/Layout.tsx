import { ReactNode } from 'react'
import FilmstripFooter from './FilmstripFooter'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <FilmstripFooter years={[]} />
    </div>
  )
}
