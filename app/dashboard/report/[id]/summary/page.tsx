"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AlertTriangle, Loader2 } from "lucide-react"
import { SeoReport } from "@/lib/seo-schema"
import {
  SummaryHeader,
  SourceDistributionChart,
  CompetitorStrengthCard,
  AdditionalAnalysisGrid,
  KeyInsightsGrid,
  KeywordsAnalysisGrid,
  OverallScoreCard,
  AIChatUpsellCard
} from "./ui"
import { Protect, useUser } from "@clerk/nextjs"
import AIChat from "@/components/AIChat"

