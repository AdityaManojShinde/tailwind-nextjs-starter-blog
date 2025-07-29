import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-2 sm:px-4 xl:max-w-7xl xl:px-2">{children}</section>
  )
}
