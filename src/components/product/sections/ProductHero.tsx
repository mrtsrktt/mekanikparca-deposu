type Props = {
  title: string
  subtitle: string
  intro: string
}

export default function ProductHero({ title, subtitle, intro }: Props) {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-amber-600 font-semibold mt-2">
        {subtitle}
      </p>
      <div className="my-5 h-[3px] w-16 bg-amber-500 rounded-full" />
      <p className="text-base md:text-lg text-slate-700 leading-relaxed">
        {intro}
      </p>
    </section>
  )
}
