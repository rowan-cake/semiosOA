import { useEffect, useState } from 'react'
import { addDays, AS_OF_DATE, getFields, getReadings, getStations } from './api/mockApi'
import { fieldAtRiskofFrost } from './frostMonitoring'
import './App.css'

type FieldStatus = { id: string; name: string; atRisk: boolean }

function App() {
  const [fields, setFields] = useState<FieldStatus[] | null>(null)
  const [hasError, setHasError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadFields() {
      try {
        const [fields, stations] = await Promise.all([getFields(), getStations()])
        if (ignore) return

        const stationIds = stations.map((station) => station.id)
        const readings = await getReadings(stationIds, addDays(AS_OF_DATE, -6), AS_OF_DATE)
        if (ignore) return

        const statuses = fields.map((field) => ({
          id: field.id,
          name: field.name,
          atRisk: fieldAtRiskofFrost(field, stations, readings),
        }))
        setFields(statuses.sort((a, b) => Number(b.atRisk) - Number(a.atRisk)))
      } catch {
        if (!ignore) setHasError(true)
      }
    }

    void loadFields()
    return () => {
      ignore = true
    }
  }, [attempt])

  return (
    <main className="frost-monitor">
      <h1>Frost Monitor</h1>
      <p>Field frost risk over the last 7 days</p>

      {hasError ? (
        <div className="field-list">
          <p role="alert">Could not load field data.</p>
          <button type="button" onClick={() => {
            setHasError(false)
            setAttempt(attempt + 1)
          }}>
            Try again
          </button>
        </div>
      ) : fields === null ? (
        <p className="field-list" role="status">Loading fields…</p>
      ) : fields.length === 0 ? (
        <p className="field-list">No fields found.</p>
      ) : (
        <ul className="field-list" role="list">
          {fields.map((field) => (
            <li className="field-row" key={field.id}>
              <strong>{field.name}</strong>
              <span className={field.atRisk ? 'risk-label at-risk' : 'risk-label'}>
                {field.atRisk ? 'At risk' : 'No frost detected'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
