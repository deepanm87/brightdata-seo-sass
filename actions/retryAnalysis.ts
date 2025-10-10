"use server"

import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")
}

const retryAnalysisOnly = async (jobId: string) => {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  try {
    await convex.action(api.analysis.retryAnalysisOnly, {
      jobId: jobId as Id<"scrapingJobs">
    })

    return {
      ok: true,
      message: "Analysis retry started successfully"
    }
  } catch (error) {
    console.error(`Failed to retry analysis: ${error}`)

    await convex.mutation(api.scrapingJobs.failJob, {
      jobId: jobId as Id<"scrapingJobs">,
      error: 
        error instanceof Error ? error.message : "Failed to retry analysis"
    })

    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to retry analysis"
    }
  }
}

export default retryAnalysisOnly