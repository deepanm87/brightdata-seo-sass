"use server"

import { ApiPath } from "@/convex/http"
import { buildPerplexityPrompt } from '@/prompts/perplexity'
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { auth } from "@clerk/nextjs/server"

if(!process.env.BRIGHTDATA_API_KEY) {
  throw new Error("BRIGHTDATA_API_KEY is not set")
}

const startScraping = async (
  prompt: string,
  existingJobId?: string,
  country: string = "US"
) => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("User ID is required")
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  let jobId: string

  if (existingJobId) {
    const retryInfo = await convex.query(api.scrapingJobs.canUseSmartRetry, {
      jobId: existingJobId as Id<"scrapingJobs">,
      userId: userId
    })

    if (retryInfo.canRetryAnalysisOnly) {
      console.log(`Using smart retry - analysis only for job: ${existingJobId}`)

      const retryAnalysisOnly = (await import("./retryAnalysis")).default

      const result = await retryAnalysisOnly(existingJobId)
      if (result.ok) {
        return {
          ok: true,
          data: { snapshot_id: null },
          jobId: existingJobId,
          smartRetry: true
        }
      } else {
        return {
          ok: false,
          error: result.error || "Smart retry failed"
        }
      }
    } else {
      console.log(`Full retry required for job: ${existingJobId}`)
      await convex.mutation(api.scrapingJobs.retryJob, {
        jobId: existingJobId as Id<"scrapingJobs">
      })
      jobId = existingJobId
    }
  } else {
    jobId = await convex.mutation(api.scrapingJobs.createScrapingJob, {
      originalPrompt: prompt,
      userId: userId
    })
  }

  const ENDPOINT = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}${ApiPath.Webhook}?jobId=${jobId}`
  const encodedEndpoint = encodeURIComponent(ENDPOINT)

    const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_m7dhdot1vw9a7gc1n&endpoint=${encodedEndpoint}&format=json&uncompressed_webhook=true&include_errors=true`

    const perplexityPrompt = buildPerplexityPrompt(prompt)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Beared ${process.env.BRIGHTDATA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: [
            {
              url: "https://www.perplexity.ai",
              prompt: perplexityPrompt,
              country: country,
              index: 1
            }
          ],
          custom_output_fields: [
            "url",
            "prompt",
            "answer_text",
            "sources",
            "citations",
            "timestamp",
            "input"
          ]
        })
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")

        await convex.mutation(api.scrapingJobs.failJob, {
          jobId: jobId as Id<"scrapingJobs">,
          error: `HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`
        })
        return {
          ok: false,
          error: `HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`
        }
      }

      const data = await response.json().catch(() => null)

      if (data && data.snapshot_id) {
        await convex.mutation(api.scrapingJobs.updateJobWithSnapshotId, {
          jobId: jobId as Id<"scrapingJobs">,
          snapshot: data.snapshot_id
        })
      }

      return {
        ok: true,
        data,
        jobId
      }
    } catch (error) {
      console.error(error)

      await convex.mutation(api.scrapingJobs.failJob, {
        jobId: jobId as Id<"scrapingJobs">,
        error: error instanceof Error ? error.message : String(error)
      })
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
}

export default startScraping
