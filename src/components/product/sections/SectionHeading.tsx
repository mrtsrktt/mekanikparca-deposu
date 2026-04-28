type Props = {
  children: React.ReactNode
}

export default function SectionHeading({ children }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
        {children}
      </h2>
      <div className="mt-3 h-1 w-14 bg-amber-500 rounded-full" />
    </div>
  )
}
