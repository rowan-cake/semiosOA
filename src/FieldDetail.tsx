import { useEffect, useState } from 'react'
import { addDays, AS_OF_DATE, getFields, getReadings, getStations, type Field } from './api/mockApi'

const dates = Array.from({ length: 7 }, (_, index) => addDays(AS_OF_DATE, index - 6))

type StationDetail = {
  id: string
  label: string
  lows: (number | null)[]
  offline: boolean
}

type DetailState =
  | { status: 'loading' | 'error' | 'missing' }
  | { status: 'ready'; field: Field; stations: StationDetail[] }

// Requires: fieldId is the ID from the detail URL.
// Modifies: nothing
// Effects: Loads the field and its stations' seven daily lows. Missing lows
// stay null, and stations missing both of the latest two days are offline.
async function loadFieldDetail(fieldId: string): Promise<DetailState> {
  const [fields, stations] = await Promise.all([getFields(), getStations([fieldId])])
  const field = fields.find((field) => field.id === fieldId)
  if (!field) return { status: 'missing' }

  const readings = stations.length === 0 ? [] : await getReadings(
    stations.map((station) => station.id), dates[0], AS_OF_DATE,
  )

  return {
    status: 'ready',
    field,
    stations: stations.map((station) => {
      const lows = dates.map((date) =>
        readings.find((reading) => reading.stationId === station.id && reading.date === date)?.lowTempC ?? null,
      )
      return { id: station.id, label: station.label, lows, offline: lows.slice(-2).every((low) => low === null) }
    }),
  }
}

// Requires: station.lows contains one value per day in date order.
// Modifies: nothing
// Effects: Shows daily lows on labeled date and temperature axes, with a
// freezing line and gaps for missing values.
// The trend compares the two most recent reported lows.
function StationChart({ station }: { station: StationDetail }) {
  const reported = station.lows.filter((low) => low !== null)
  const tickStep = Math.max(1, Math.ceil(Math.max(...reported.map(Math.abs)) / 2))
  const max = tickStep * 2
  const min = -max
  const ticks = [max, tickStep, 0, -tickStep, min]
  const points = station.lows.map((low, day) => low === null ? null : {
    x: 46 + day * 39,
    y: 35 + (max - low) / (max - min) * 110,
  })
  const path = points.map((point, day) => point
    ? `${points[day - 1] ? 'L' : 'M'}${point.x},${point.y}`
    : '',
  ).join(' ')
  const latest = reported.at(-1)
  const previous = reported.at(-2)
  const trend = latest === undefined || previous === undefined ? 'Trend unavailable'
    : latest < previous ? '↓ Getting colder' : latest > previous ? '↑ Getting warmer' : '→ Steady'

  return (
    <section className="station-chart" aria-label={`${station.label} temperature readings`}>
      <h2>{station.label} · Daily low</h2>
      <p>{trend}</p>
      {reported.length === 0 ? <p>No readings in the last 7 days.</p> : (
        <svg viewBox="0 0 300 205" role="img" aria-label={`${station.label} daily low temperatures in Celsius by date. Exact values are available under Daily temperatures.`}>
          <text x="46" y="18">Temperature (°C)</text>
          {ticks.map((tick, index) => (
            <g key={tick}>
              <line className={tick === 0 ? 'freezing-line' : 'chart-grid'}
                x1="46" y1={35 + index * 27.5} x2="280" y2={35 + index * 27.5} />
              <text x="37" y={39 + index * 27.5} textAnchor="end">{tick}</text>
            </g>
          ))}
          <path className="chart-axis" d="M46 35V145H280" />
          {dates.map((date, day) => (
            <g key={date}>
              <line className="chart-axis" x1={46 + day * 39} y1="145" x2={46 + day * 39} y2="150" />
              {day % 2 === 0 && <text x={46 + day * 39} y="167" textAnchor="middle">{date.slice(5)}</text>}
            </g>
          ))}
          <text x="163" y="193" textAnchor="middle">Date (MM-DD)</text>
          <path className="temperature-line" d={path} />
          {points.map((point, day) => point && (
            <circle key={dates[day]} className="temperature-point" cx={point.x} cy={point.y} r="3" />
          ))}
        </svg>
      )}
      <details>
        <summary>Daily temperatures</summary>
        <dl className="daily-lows">
          {dates.map((date, day) => (
            <div key={date}>
              <dt><time dateTime={date}>{date.slice(5)}</time></dt>
              <dd>{station.lows[day] === null ? 'No reading' : `${station.lows[day]} °C`}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  )
}

// Requires: fieldId is the ID from the detail URL.
// Modifies: Updates local request and station selection state.
// Effects: Displays the field's station selector and the selected station's
// chart, with loading, retry, and empty states.
export default function FieldDetail({ fieldId }: { fieldId: string }) {
  const [detail, setDetail] = useState<DetailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [stationId, setStationId] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    loadFieldDetail(fieldId).then(
      (result) => { if (!ignore) setDetail(result) },
      () => { if (!ignore) setDetail({ status: 'error' }) },
    )
    return () => { ignore = true }
  }, [fieldId, attempt])

  const selected = detail.status === 'ready'
    ? detail.stations.find((station) => station.id === stationId) ?? detail.stations[0]
    : undefined

  return (
    <main className="frost-monitor">
      <a className="back-to-fields" href="/">← All fields</a>
      <h1>{detail.status === 'ready' ? detail.field.name : 'Field detail'}</h1>
      {detail.status === 'loading' && <p role="status">Loading stations…</p>}
      {detail.status === 'missing' && <p>Field not found.</p>}
      {detail.status === 'error' && (
        <>
          <p role="alert">Could not load field details.</p>
          <button type="button" onClick={() => {
            setDetail({ status: 'loading' })
            setAttempt(attempt + 1)
          }}>Try again</button>
        </>
      )}
      {detail.status === 'ready' && (
        <>
          <p>{detail.field.crop} · Last 7 days</p>
          <h2 className="station-heading">Weather stations</h2>
          {detail.stations.length === 0 ? <p>No stations found.</p> : (
            <div className="station-grid" role="group" aria-label="Weather stations">
              {detail.stations.map((station) => (
                <button key={station.id} type="button" aria-pressed={station.id === selected?.id}
                  onClick={() => setStationId(station.id)}>
                  <span className="station-star" aria-hidden="true">★</span>
                  {station.label}
                  {station.offline && <small>Offline</small>}
                </button>
              ))}
            </div>
          )}
          {selected && <StationChart key={selected.id} station={selected} />}
        </>
      )}
    </main>
  )
}
