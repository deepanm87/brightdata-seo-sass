"use client"

import { PricingTable } from "@clerk/clerk-react"

export default function PricingPage() {
  return (
    <div>
      PricingPage
      <PricingTable newSubscriptionRedirectUrl="/dashboard" />
    </div>
  )
}