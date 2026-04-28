import { getProductDescription } from '@/lib/product-descriptions'
import ProductHero from './sections/ProductHero'
import TrustBadges from './sections/TrustBadges'
import WhyThisModel from './sections/WhyThisModel'
import WhoIsItFor from './sections/WhoIsItFor'
import TechSpecsTable from './sections/TechSpecsTable'
import ProductFAQ from './sections/ProductFAQ'

type Props = {
  slug: string
}

export default function EnrichedDescription({ slug }: Props) {
  const data = getProductDescription(slug)
  if (!data) return null

  return (
    <div className="space-y-12 md:space-y-16">
      <ProductHero {...data.hero} />
      <TrustBadges badges={data.trustBadges} />
      <WhyThisModel {...data.whyThisModel} />
      <WhoIsItFor {...data.whoIsItFor} />
      <TechSpecsTable {...data.techSpecs} />
      <ProductFAQ {...data.faq} />
    </div>
  )
}

export function hasEnrichedDescription(slug: string): boolean {
  return getProductDescription(slug) !== null
}
