import { NextResponse } from 'next/server'

function resolveDeploymentUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL

  if (rawUrl) {
    return rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
  }

  return 'https://sw-pfe-solar-final.vercel.app'
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      deploymentUrl: resolveDeploymentUrl(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      git: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
        commitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
        commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
      },
      generatedAt: new Date().toISOString(),
    },
  })
}
