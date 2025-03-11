import { PrismaClient, WebsiteStatus } from '@prisma/client'
import https from 'https'
import tls from 'tls'

const prisma = new PrismaClient()

interface WebsiteHealthCheckResult {
    status: WebsiteStatus
    sslExpirationDays?: number
    error?: string
}

export async function checkWebsiteHealth(websiteUrl: string): Promise<WebsiteHealthCheckResult> {
    try {
        // Check website availability
        const websiteResponse = await fetchWebsiteStatus(websiteUrl)

        // Check SSL certificate
        const sslCheck = await checkSSLCertificate(websiteUrl)

        // Determine overall status
        let finalStatus: WebsiteStatus = WebsiteStatus.RUNNING

        if (websiteResponse.statusCode !== 200) {
            finalStatus = WebsiteStatus.PROBLEMATIC
        }

        if (sslCheck.sslExpirationDays && sslCheck.sslExpirationDays < 30) {
            finalStatus = WebsiteStatus.PROBLEMATIC
        }

        return {
            status: finalStatus,
            sslExpirationDays: sslCheck.sslExpirationDays
        }
    } catch (error) {
        return {
            status: WebsiteStatus.STOPPED,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

function fetchWebsiteStatus(url: string): Promise<{ statusCode: number }> {
    return new Promise((resolve, reject) => {
        try {
            const req = https.request(url, (res) => {
                resolve({ statusCode: res.statusCode || 500 })
                req.end()
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.setTimeout(10000, () => {
                req.destroy()
                reject(new Error('Request timed out'))
            })

            req.end()
        } catch (error) {
            reject(error)
        }
    })
}

function checkSSLCertificate(url: string): Promise<{ sslExpirationDays?: number }> {
    return new Promise((resolve, reject) => {
        try {
            const hostname = new URL(url).hostname

            const options = {
                host: hostname,
                port: 443,
                method: 'GET'
            }

            const req = https.request(options, (res) => {
                const cert = res.socket && (res.socket as tls.TLSSocket).getPeerCertificate()

                if (cert) {
                    const expirationDate = new Date(cert.valid_to)
                    const today = new Date()
                    const timeDiff = expirationDate.getTime() - today.getTime()
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

                    resolve({ sslExpirationDays: daysDiff })
                } else {
                    resolve({})
                }

                res.destroy()
            })

            req.on('error', (error) => {
                reject(error)
            })

            req.end()
        } catch (error) {
            reject(error)
        }
    })
}

export async function runWebsiteHealthChecks() {
    // Fetch all websites
    const websites = await prisma.website.findMany()

    // Run health checks for each website
    for (const website of websites) {
        try {
            const healthCheck = await checkWebsiteHealth(website.url)

            // Update website status in database
            await prisma.website.update({
                where: { id: website.id },
                data: {
                    status: healthCheck.status,
                    lastHealthCheck: new Date()
                }
            })
        } catch (error) {
            console.error(`Health check failed for ${website.url}:`, error)
        }
    }
}

// Optional: Set up a periodic health check (can be implemented via cron job or serverless function)