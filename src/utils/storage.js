const STORAGE_KEY = 'ct_registros_turno'

export const getRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveRecord = (record) => {
  const records = getRecords()
  const newRecord = {
    ...record,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    fechaRegistro: new Date().toISOString(),
  }
  records.push(newRecord)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  return newRecord
}

export const getLastRecord = (plant) => {
  const records = getRecords()
  const plantRecords = records
    .filter(r => r.planta === plant)
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
  return plantRecords[0] || null
}

export const getRecordsByPlant = (plant) => {
  return getRecords()
    .filter(r => r.planta === plant)
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
}
