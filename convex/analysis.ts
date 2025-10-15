"use node"

import { internalAction, action } from "./_generated/server"
import { v } from "convex/values"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { buildAnalysisPrompt, systemPrompt } from "@/prompts/gpt"
import { seoReportSchema } from "@/lib/seo-schema"
import { internal, api } from "./_generated/api"

export const runAnalysis = internalAction({
  args: {
    jobId: v.id("scrapingJobs")
  },
  returns: v.null(),
  handler: async (ctx, args) => {

    try {
      const job = await ctx.runQuery(api.scrapingJobs.getJobById, {
        jobId: args.jobId
      })

      if (!job) {
        console.error(`No job found for job ID: ${args.jobId}`)
        return null
      }

      if (!job.results || job.results.length === 0) {
        console.error(`No scraping results found for job: ${args.jobId}`)
        await ctx.runMutation(api.scrapingJobs.failJob, {
          jobId: args.jobId,
          error: "No scraping results available for analysis"
        })
        return null
      }

      await ctx.runMutation(api.scrapingJobs.setJobToAnalyzing, {
        jobId: args.jobId
      })

      const scrapingData = Array.isArray(job.results)
        ? job.results
        : [job.results]
      const analysisPrompt = buildAnalysisPrompt(scrapingData)

      await ctx.runMutation(internal.scrapingJobs.saveOriginalPrompt, {
        jobId: args.jobId,
        prompt: analysisPrompt
      })

      const { object: seoReport } = await generateObject({
        model: openai("gpt-4o"),
        system: systemPrompt(),
        prompt: analysisPrompt,
        schema: seoReportSchema
      })

      await ctx.runMutation(internal.scrapingJobs.saveSeoReport, {
        jobId: args.jobId,
        seoReport: seoReport
      })

      await ctx.runMutation(internal.scrapingJobs.completeJob, {
        jobId: args.jobId
      })

      return null
    } catch (error) {
      console.error(`Analysis error for job: ${args.jobId} ${error}`)

      try {
        await ctx.runMutation(api.scrapingJobs.failJob, {
          jobId: args.jobId,
          error: 
            error instanceof Error
              ? error.message
              : "Unknown error occurred during analysis"
        })
      } catch (failError) {
        console.error(`Failed to update job status to failed: ${failError}`)
      }

      if (error instanceof Error && error.message.includes("schema")) {
        console.error("Schema validation failed - AI response incomplete")
        console.error(`Error details: ${error.message}`)
      }

      return null
    }
  }
})

export const retryAnalysisOnly = action({
  args: {
    jobId: v.id("scrapingJobs")
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.scrapingJobs.resetJobForAnalysisRetry, {
      jobId: args.jobId
    })

    await ctx.runAction(internal.analysis.runAnalysis, {
      jobId: args.jobId
    })

    return null
  }
})