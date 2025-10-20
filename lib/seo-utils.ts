import {
  seoReportSchema,
  scrapingDataSchema,
  type SeoReport,
  type ScrapingData
} from "@/lib/seo-schema"

export function validateSeoReport(data: unknown): SeoReport {
  return seoReportSchema.parse(data)
}

export function validateScrapingData(data: unknown): ScrapingData {
  return scrapingDataSchema.parse(data)
}

export function safeValidateSeoReport(data: unknown): SeoReport | null {
  try {
    return seoReportSchema.parse(data)
  } catch (error) {
    console.error(`SEO report validation failed ${error}`)
    return null
  }
}

export function safeValidateScrapingData(data: unknown): ScrapingData | null {
  try {
    return scrapingDataSchema.parse(data)
  } catch (error) {
    console.error(`Scraping data validation failed: ${error}`)
    return null
  }
}

export function getSeoReportSchemaStructure() {
  return {
    sections: Object.keys(seoReportSchema.shape),
    totalSections: Object.keys(seoReportSchema.shape).length,
    schema: seoReportSchema
  }
}

export function isSeoReport(data: unknown): data is SeoReport {
  try {
    seoReportSchema.parse(data)
    return true
  } catch {
    return false
  }
}

export function isScrapingData(data: unknown): data is ScrapingData {
  try {
    scrapingDataSchema.parse(data)
    return true
  } catch {
    return false
  }
}