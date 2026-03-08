import { useState, useMemo } from 'react'
import { PLANTS, PLANT_LABELS, PLANT_COLORS } from '../constants.js'
import { getRecords } from '../utils/storage.js'
import { exportToCSV } from '../utils/csvExport.js'

const ALL_FILTERS = [{ id: 'all', label: 'Todas' }, ...PLANTS]

const RECORD_FIELD_LABELS = [
  ['horasProgramadas', 'Horas Programadas'],
  ['horasMantenimientoProgramado', 'Horas Mant. Prog.'],
  ['horometroPlanta', 'Horometro Planta'],
  ['pesometroAlimentacion', 'Pesometro Alimentacion'],
  ['litrosPetroleo', 'Litros Petroleo'],
  ['horometroGenerador', 'Horometro Generador'],
  ['kilosFloculante', 'Kilos Floculante'],
  ['pesometroProduccion', 'Pesometro Produccion'],
  ['flujo', 'Flujo (Ton/h)'],
  ['numeroBolasM1', 'N Bolas M1'],
  ['numeroBolasM2', 'N Bolas M2'],
  ['pesometroProduccionCuarzo', 'Pesometro Prod. Cuarzo'],
  ['pesometroProduccionArenas', 'Pesometro Prod. Arenas'],
  ['horometroVSI', 'Horometro VSI'],
  ['litrosPetroleoVSI', 'Litros Petroleo VSI'],
  ['detencionOperacion1', 'Det. Op. 1'],
  ['tiempoDetencionOperacion1', 'Tiempo Det. Op. 1 (min)'],
  ['detencionOperacion2', 'Det. Op. 2'],
  ['tiempoDetencionOperacion2', 'Tiempo Det. Op. 2 (min)'],
  ['detencionMantencion1', 'Det. Mant. 1'],
  ['tiempoDetencionMantencion1', 'Tiempo Det. Mant. 1 (min)'],
  ['detencionMantencion2', 'Det. Mant. 2'],
  ['tiempoDetencionMantencion2', 'Tiempo Det. Mant. 2 (min)'],
  ['creadoPor', 'Creado Por'],
]

function RecordCard({ record }) {
  const [expanded, setExpanded] = useState(false)
  const color = PLANT_COLORS[record.planta] || '#1e3a5f'
  const plant = PLANT_LABELS[record.planta] || record.planta
  const isCerrado = record.estado === 'Cerrado'

  return (
    <div className="record-card" style={{ borderLeftColor: color }}>
      <button
        className="record-card-header"
        onClick={() => setExpanded(v => !v)}
        type="button"
        aria-expanded={expanded}
      >
        <div className="record-card-left">
          <span className="record-plant-dot" style={{ background: color }} />
          <div>
            <span className="record-plant-name">{plant}</span>
            <span className="record-meta">
              {record.fecha} &nbsp;&middot;&nbsp; Turno {record.turno} &nbsp;&middot;&nbsp; {record.sop}
            </span>
          </div>
        </div>
        <div className="record-card-right">
          <span className={`badge ${isCerrado ? 'badge-closed' : 'badge-review'}`}>
            {record.estado}
          </span>
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="record-detail">
          <div className="record-detail-grid">
            <div className="detail-item">
              <span className="detail-label">Tipo Material</span>
              <span className="detail-value">{record.tipoMaterial}</span>
            </div>
            {RECORD_FIELD_LABELS.map(([key, label]) => {
              const v = record[key]
              if (v === undefined || v === '' || v === null) return null
              return (
                <div key={key} className="detail-item">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{v}</span>
                </div>
              )
            })}
          </div>
          <div className="detail-footer">
            Guardado: {new Date(record.fechaRegistro).toLocaleString('es-CL')}
          </div>
        </div>
      )}
    </div>
  )
}

export default function History({ onBack }) {
  const [filter, setFilter] = useState('all')
  const allRecords = useMemo(
    () => getRecords().sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)),
    []
  )

  const filtered = useMemo(
    () => filter === 'all' ? allRecords : allRecords.filter(r => r.planta === filter),
    [allRecords, filter]
  )

  return (
    <div className="page">
      <header className="form-header">
        <button className="btn-back" onClick={onBack} type="button">
          &#8592; Volver
        </button>
        <div className="form-header-title">
          <span className="form-header-label">Historial</span>
          <span className="form-header-plant">Registros guardados</span>
        </div>
      </header>

      <div className="filter-bar">
        {ALL_FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-btn${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="history-toolbar">
        <span className="history-count">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </span>
        <button
          className="btn-action btn-export"
          onClick={() => exportToCSV(filtered)}
          type="button"
        >
          &#11015; Exportar CSV
        </button>
      </div>

      <div className="history-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No hay registros para mostrar.</p>
            <p>Llene un formulario de cierre de turno para comenzar.</p>
          </div>
        ) : (
          filtered.map(record => (
            <RecordCard key={record.id} record={record} />
          ))
        )}
      </div>
    </div>
  )
}
