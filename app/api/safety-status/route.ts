import { NextResponse } from 'next/server'

interface RelayState {
  inverter: boolean
  block1: boolean
  block2: boolean
}

interface SafetyOverrideState {
  emergencyShutdown: boolean
  reason: string
  triggeredAt: string
}

interface ControlState {
  mode: 'manual' | 'ai'
  relays: RelayState
  updatedAt: string
  source: string
  safetyOverride?: SafetyOverrideState
}

const FIREBASE_RTDB_URL =
  process.env.FIREBASE_RTDB_URL ||
  'https://fir-esp-16cb0-default-rtdb.europe-west1.firebasedatabase.app'

async function readControlFromFirebase(): Promise<ControlState | null> {
  const baseUrl = FIREBASE_RTDB_URL.replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/control.json`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Firebase control read failed (${response.status})`)
  }

  const data = (await response.json()) as ControlState | null
  if (!data || !data.relays) {
    return null
  }

  return data
}

export async function GET() {
  try {
    const controlState = await readControlFromFirebase()
    const safetyOverride = controlState?.safetyOverride

    return NextResponse.json({
      success: true,
      data: {
        emergencyActive: Boolean(safetyOverride?.emergencyShutdown),
        reason: safetyOverride?.reason || null,
        triggeredAt: safetyOverride?.triggeredAt || null,
        updatedAt: controlState?.updatedAt || null,
        source: controlState?.source || null,
        relays: controlState?.relays || null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read safety status',
        details: String(error),
        data: {
          emergencyActive: false,
          reason: null,
          triggeredAt: null,
          updatedAt: null,
          source: null,
          relays: null,
        },
      },
      { status: 500 },
    )
  }
}
