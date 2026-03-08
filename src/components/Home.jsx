import { useState } from 'react'
import { PLANTS } from '../constants.js'
import { getRecords } from '../utils/storage.js'
import { exportToCSV } from '../utils/csvExport.js'

export default function Home({ onOpenForm, onOpenHistory }) {
  const [records] = useState(() => getRecords())

  const getCount = (plantId) => records.filter(r => r.planta === plantId).length

  const getLastDate = (plantId) => {
    const pr = records
      .filter(r => r.planta === plantId)
      .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    if (!pr.length) return null
    return pr[0].fecha + ' T' + (pr[0].turno || '')
  }

  const handleExport = () => {
    exportToCSV(records)
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-icon">CT</div>
        <h1>Cierre de Turno</h1>
        <p>Operacion Minera — Seleccione una planta</p>
      </header>

      <div className="home-content">
        <div className="home-actions">
          <button className="btn-action btn-history" onClick={onOpenHistory}>
            <span className="btn-icon">&#128203;</span>
            Historial
          </button>
          <button className="btn-action btn-export" onClick={handleExport}>
            <span className="btn-icon">&#11015;</span>
            Exportar CSV
          </button>
        </div>

        <div className="section-label">Plantas</div>

        <div className="plant-grid">
          {PLANTS.map(plant => (
            <button
              key={plant.id}
              className="plant-btn"
              onClick={() => onOpenForm(plant.id)}
            >
              <div className="plant-avatar" style={{ background: plant.color }}>
                {plant.abbr}
              </div>
              <div className="plant-info">
                <span className="plant-name">{plant.label}</span>
                <span className="plant-meta">
                  {getCount(plant.id)} registro{getCount(plant.id) !== 1 ? 's' : ''}
                  {getLastDate(plant.id) && (
                    <> &middot; {getLastDate(plant.id)}</>
                  )}
                </span>
              </div>
              <span className="plant-arrow">&#8250;</span>
            </button>
          ))}
        </div>

        <div className="home-total">
          {records.length} registro{records.length !== 1 ? 's' : ''} en total
        </div>
      </div>
    </div>
  )
}
