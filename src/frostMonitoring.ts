import {addDays, AS_OF_DATE, type Field, type Station, type Reading} from './api/mockApi.ts'


// Risk if any of its stations recorded a daily low of 0 °C or below in the last 7
// days.


// Requires: Stations and readings have already been fetched.
// Modifies: nothing
// Effects: Returns true if the field is at risk of frost. False otherwise
export function fieldAtRiskofFrost(field:Field, stations:readonly Station[], readings:readonly Reading[]):boolean{
    const stationIds = new Set(stations.filter(station => station.fieldId === field.id).map(station => station.id))
    const startDate = addDays(AS_OF_DATE, -6)
    return readings.some(reading => stationIds.has(reading.stationId) &&
        reading.date >= startDate && reading.date <= AS_OF_DATE &&
        reading.lowTempC !== null && reading.lowTempC <= 0)
}
