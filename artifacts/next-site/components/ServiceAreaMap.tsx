'use client'

import { useState, useEffect } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { ATHENS_COORDS, CONTACT_SERVICE_RADIUS_MILES } from '@/lib/contact-service-area'

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
  .center(ATHENS_COORDS)
  .scale(10000)
  .translate([450, 280])

const pathGen = d3.geoPath(projection)

const CITIES: { name: string; coords: [number, number] }[] = [
  { name: 'Atlanta',      coords: [-84.388,  33.749]  },
  { name: 'Gainesville',  coords: [-83.8291, 34.2901] },
  { name: 'Toccoa',       coords: [-83.3272, 34.5821] },
  { name: 'Hartwell',     coords: [-82.9280, 34.3496] },
  { name: 'Elberton',     coords: [-82.8728, 34.1049] },
  { name: 'Washington',   coords: [-82.7423, 33.7352] },
  { name: 'Madison',      coords: [-83.4760, 33.5790] },
  { name: 'Covington',    coords: [-83.8466, 33.6054] },
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

        const circle = d3.geoCircle().center(ATHENS_COORDS)
          .radius((CONTACT_SERVICE_RADIUS_MILES / 3958.7613) * (180 / Math.PI))()
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
        <svg viewBox="0 0 900 560" width="100%" role="img" aria-label="Georgia service area within 75 miles of Athens; coverage stops at the state border">
          <defs>
            <clipPath id="contact-georgia-coverage">
              {statePaths.filter(s => s.isGeorgia).map(s => <path key={s.id} d={s.d} />)}
            </clipPath>
          </defs>
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

          {/* Clip the 75-mile radius at Georgia's state border. */}
          {circleD && (
            <path
              d={circleD}
              clipPath="url(#contact-georgia-coverage)"
              fill="#990000"
              fillOpacity={0.16}
              stroke="#990000"
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
              fill="#990000"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <rect
              x={ax + 10}
              y={ay - 11}
              width={82}
              height={20}
              rx={4}
              fill="#990000"
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
          75-mile service radius from Athens, GA — Georgia only
        </span>
      </div>
    </div>
  )
}
