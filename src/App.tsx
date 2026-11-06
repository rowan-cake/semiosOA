import { useEffect, useState } from 'react'
import { addDays, AS_OF_DATE, getFields, getReadings, getStations, type Field } from './api/mockApi'
import { summarizeFieldFrost } from './frostMonitoring'
import './App.css'

type FieldStatus = Field & ReturnType<typeof summarizeFieldFrost>

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
          ...field,
          ...summarizeFieldFrost(field, stations, readings),
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
              <div className="field-heading">
                <h2><a href={`/fields/${field.id}`}>{field.name}</a></h2>
                {field.atRisk && <span className="risk-label at-risk">At risk of frost</span>}
              </div>
              <dl className="field-details">
                <div><dt>Crop</dt><dd>{field.crop}</dd></div>
                <div>
                  <dt>Coldest daily low (last 7 days)</dt>
                  <dd>{field.coldestLow === null ? 'No readings' : `${field.coldestLow} °C`}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
