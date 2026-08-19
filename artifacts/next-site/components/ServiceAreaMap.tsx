'use client'

import { useState, useEffect } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

const SHOWN_STATES = new Set([
  'Georgia',
  'South Carolina',
  'North Carolina',
  'Tennessee',
  'Alabama',
  'Florida',
  'Mississippi',
  'Virginia',
  'Kentucky',
])

const projection = d3
  .geoMercator()
  .center([-84.0, 34.1])
  .scale(5300)
  .translate([450, 280])

const pathGen = d3.geoPath(projection)

const ATHENS_COORDS: [number, number] = [-83.3576, 33.9519]

const CITIES: { name: string; coords: [number, number] }[] = [
  { name: 'Atlanta',      coords: [-84.388,  33.749]  },
  { name: 'Augusta',      coords: [-81.9748, 33.4735] },
  { name: 'Macon',        coords: [-83.6324, 32.8407] },
  { name: 'Columbus',     coords: [-84.9877, 32.461]  },
  { name: 'Savannah',     coords: [-81.0912, 32.0809] },
  { name: 'Greenville',   coords: [-82.394,  34.8526] },
  { name: 'Columbia',     coords: [-81.0348, 34.0007] },
  { name: 'Charlotte',    coords: [-80.8431, 35.2271] },
  { name: 'Chattanooga',  coords: [-85.3097, 35.0456] },
  { name: 'Knoxville',    coords: [-83.9207, 35.9606] },
  { name: 'Asheville',    coords: [-82.5515, 35.5951] },
]

interface StatePath { id: string; d: string; isGeorgia: boolean }

export default function ServiceAreaMap() {
  const [statePaths, setStatePaths] = useState<StatePath[]>([])
  const [circleD, setCircleD]       = useState('')
  const [loaded, setLoaded]         = useState(false)

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then((r) => r.json())
      .then((raw) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topo = raw as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collection = topojson.feature(topo, topo.objects.states) as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const features: any[] = collection.features ?? []

        setStatePaths(
          features
            .filter((f) => SHOWN_STATES.has(f.properties?.name ?? ''))
            .map((f, i) => ({
              id:         String(i),
              d:          pathGen(f) ?? '',
              isGeorgia:  f.properties?.name === 'Georgia',
            })),
        )

        const circle = d3.geoCircle().center(ATHENS_COORDS).radius(2.895)()
        setCircleD(pathGen(circle) ?? '')
        setLoaded(true)
      })
      .catch(console.error)
  }, [])

  // Pre-project all coordinates
  const projectedCities = CITIES.map((c) => {
    const pt = projection(c.coords)
    return { name: c.name, x: pt?.[0] ?? 0, y: pt?.[1] ?? 0 }
  })
  const athensPt = projection(ATHENS_COORDS)
  const ax = athensPt?.[0] ?? 0
  const ay = athensPt?.[1] ?? 0

  return (
    <div className="bg-surface rounded-lg p-4">
      {!loaded ? (
        <div className="flex items-center justify-center h-72">
          <p className="font-body text-ink-muted text-sm">Loading map…</p>
        </div>
      ) : (
        <svg viewBox="0 0 900 560" width="100%">
          {/* State fills */}
          {statePaths.map((s) => (
            <path
              key={s.id}
              d={s.d}
              fill={s.isGeorgia ? '#1B2A4D' : '#141414'}
              stroke="#454141"
              strokeWidth={1}
            />
          ))}

          {/* 200-mile radius circle */}
          {circleD && (
            <path
              d={circleD}
              fill="#D60002"
              fillOpacity={0.16}
              stroke="#D60002"
              strokeWidth={2}
            />
          )}

          {/* City dots + text labels */}
          {projectedCities.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r={4} fill="#F5F1ED" />
              <text
                x={c.x + 7}
                y={c.y + 4}
                fontFamily="Inter, sans-serif"
                fontWeight={500}
                fontSize={11}
                fill="#F5F1ED"
              >
                {c.name}
              </text>
            </g>
          ))}

          {/* Athens — drawn last so it sits on top */}
          <g>
            <circle
              cx={ax}
              cy={ay}
              r={6}
              fill="#D60002"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <rect
              x={ax + 10}
              y={ay - 11}
              width={82}
              height={20}
              rx={4}
              fill="#D60002"
            />
            <text
              x={ax + 51}
              y={ay + 3}
              fontFamily="Poppins, sans-serif"
              fontWeight={700}
              fontSize={12}
              fill="#FFFFFF"
              textAnchor="middle"
            >
              Athens, GA
            </text>
          </g>
        </svg>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 px-1">
        <div className="w-4 h-4 rounded-sm border-2 border-brand-red bg-brand-red/35 shrink-0" />
        <span className="font-body text-sm text-paper">
          200-mile service radius from Athens, GA
        </span>
      </div>
    </div>
  )
}
