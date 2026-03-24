import { useState, useEffect, useRef } from 'react'
import { PLANT_LABELS, PLANT_COLORS, SOP_OPTIONS, MATERIAL_OPTIONS, TURNO_OPTIONS, ESTADO_OPTIONS } from '../constants.js'
import { getLastRecord, saveRecord } from '../utils/storage.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isNum = (v) =>
  v !== '' && v !== null && v !== undefined && !isNaN(Number(v))

// Campos acumulativos sujetos a la regla del 5× (nombre → etiqueta legible)
const RANGE_FIELDS = {
  horometroPlanta:           'Horometro Planta',
  pesometroAlimentacion:     'Pesometro Alimentacion',
  horometroGenerador:        'Horometro Generador',
  litrosPetroleo:            'Litros de Petroleo',
  kilosFloculante:           'Kilos de Floculante',
  pesometroProduccion:       'Pesometro Produccion',
  pesometroProduccionCuarzo: 'Pesometro Prod. Cuarzo',
  pesometroProduccionArenas: 'Pesometro Prod. Arenas',
  horometroVSI:              'Horometro VSI',
  litrosPetroleoVSI:         'Litros Petroleo VSI',
}

const getInitialState = (plant) => {
  const base = {
    fecha: new Date().toISOString().slice(0, 10),
    turno: '',
    sop: '',
    tipoMaterial: '',
    horasProgramadas: '',
    horasMantenimientoProgramado: '',
    horometroPlanta: '',
    pesometroAlimentacion: '',
    litrosPetroleo: '',
    horometroGenerador: '',
    kilosFloculante: '',
    detencionOperacion1: '',
    tiempoDetencionOperacion1: '',
    detencionOperacion2: '',
    tiempoDetencionOperacion2: '',
    detencionMantencion1: '',
    tiempoDetencionMantencion1: '',
    detencionMantencion2: '',
    tiempoDetencionMantencion2: '',
    estado: 'En revision',
    creadoPor: '',
  }
  if (plant === 'cuarzo') {
    return {
      ...base,
      pesometroProduccionCuarzo: '',
      pesometroProduccionArenas: '',
      horometroVSI: '',
      litrosPetroleoVSI: '',
    }
  }
  return {
    ...base,
    pesometroProduccion: '',
    numeroBolasM1: '',
    numeroBolasM2: '',
    flujo: '',
  }
}

const validate = (data, plant, lastRecord) => {
  const errors = {}
  const lr = lastRecord

  // --- Selects / texto
  if (!data.fecha) errors.fecha = 'La fecha es obligatoria'
  if (!data.turno) errors.turno = 'Seleccione un turno'
  if (!data.sop) errors.sop = 'Seleccione el SOP'
  if (!data.tipoMaterial) errors.tipoMaterial = 'Seleccione el tipo de material'
  if (!data.creadoPor || !data.creadoPor.trim()) errors.creadoPor = 'Ingrese el nombre del operador'

  // --- Horas
  if (!isNum(data.horasProgramadas)) {
    errors.horasProgramadas = 'Ingrese las horas programadas'
  } else if (Number(data.horasProgramadas) < 0 || Number(data.horasProgramadas) > 12) {
    errors.horasProgramadas = 'Debe estar entre 0 y 12'
  }

  if (!isNum(data.horasMantenimientoProgramado)) {
    errors.horasMantenimientoProgramado = 'Ingrese las horas de mantenimiento'
  } else if (Number(data.horasMantenimientoProgramado) < 0 || Number(data.horasMantenimientoProgramado) > 12) {
    errors.horasMantenimientoProgramado = 'Debe estar entre 0 y 12'
  }

  // --- Funcion para campos monotonicos
  const checkMonotonic = (field, label) => {
    if (!isNum(data[field])) {
      errors[field] = `Ingrese ${label}`
    } else if (
      lr &&
      lr[field] !== undefined &&
      lr[field] !== '' &&
      isNum(lr[field]) &&
      Number(data[field]) < Number(lr[field])
    ) {
      errors[field] = `No puede ser menor al ultimo registro: ${lr[field]}`
    }
  }

  checkMonotonic('horometroPlanta', 'el horometro de planta')
  checkMonotonic('pesometroAlimentacion', 'el pesometro de alimentacion')
  checkMonotonic('horometroGenerador', 'el horometro de generador')

  if (!isNum(data.litrosPetroleo)) errors.litrosPetroleo = 'Ingrese los litros de petroleo'
  if (!isNum(data.kilosFloculante)) errors.kilosFloculante = 'Ingrese los kilos de floculante'

  // --- Campos por tipo de planta
  if (plant === 'cuarzo') {
    checkMonotonic('pesometroProduccionCuarzo', 'el pesometro de produccion cuarzo')
    checkMonotonic('horometroVSI', 'el horometro VSI')
    if (!isNum(data.litrosPetroleoVSI)) errors.litrosPetroleoVSI = 'Ingrese los litros de petroleo VSI'
    // pesometroProduccionArenas es opcional, solo validar si se ingreso
    if (data.pesometroProduccionArenas !== '' && data.pesometroProduccionArenas !== null) {
      if (!isNum(data.pesometroProduccionArenas)) {
        errors.pesometroProduccionArenas = 'Debe ser un numero valido'
      } else if (
        lr && lr.pesometroProduccionArenas && isNum(lr.pesometroProduccionArenas) &&
        Number(data.pesometroProduccionArenas) < Number(lr.pesometroProduccionArenas)
      ) {
        errors.pesometroProduccionArenas = `No puede ser menor al ultimo registro: ${lr.pesometroProduccionArenas}`
      }
    }
  } else {
    checkMonotonic('pesometroProduccion', 'el pesometro de produccion')
    if (!isNum(data.numeroBolasM1)) errors.numeroBolasM1 = 'Ingrese el numero de bolas M1'
    if (!isNum(data.numeroBolasM2)) errors.numeroBolasM2 = 'Ingrese el numero de bolas M2'
    if (!isNum(data.flujo)) errors.flujo = 'Ingrese el flujo'
  }

  // --- Detenciones
  const dets = [
    ['detencionOperacion1', 'tiempoDetencionOperacion1', 'Detencion Operacion 1'],
    ['detencionOperacion2', 'tiempoDetencionOperacion2', 'Detencion Operacion 2'],
    ['detencionMantencion1', 'tiempoDetencionMantencion1', 'Detencion Mantencion 1'],
    ['detencionMantencion2', 'tiempoDetencionMantencion2', 'Detencion Mantencion 2'],
  ]
  dets.forEach(([descField, timeField, label]) => {
    if (!data[descField] || !data[descField].trim())
      errors[descField] = `Describa la ${label}`
    if (!isNum(data[timeField]))
      errors[timeField] = 'Ingrese el tiempo (min)'
  })

  return errors
}

// ---------------------------------------------------------------------------
// Subcomponentes de campo
// ---------------------------------------------------------------------------
function Field({ name, label, hint, type = 'text', required = true, value, onChange, error, ...rest }) {
  return (
    <div className={`field${error ? ' field-error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      {hint && <span className="field-hint">{hint}</span>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        inputMode={type === 'number' ? 'decimal' : undefined}
        autoComplete="off"
        {...rest}
      />
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}

function Select({ name, label, options, value, onChange, error, required = true }) {
  return (
    <div className={`field${error ? ' field-error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      <select id={name} name={name} value={value} onChange={onChange}>
        <option value="">-- Seleccionar --</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <span className="error-msg">{error}</span>}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="form-section">
      <div className="section-header">{title}</div>
      <div className="section-body">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function ShiftForm({ plant, onBack, onSaved }) {
  const [form, setForm] = useState(() => getInitialState(plant))
  const [errors, setErrors] = useState({})
  const [lastRecord, setLastRecord] = useState(null)
  const [saved, setSaved] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    setLastRecord(getLastRecord(plant))
    setForm(getInitialState(plant))
    setErrors({})
    setSaved(false)
  }, [plant])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (!RANGE_FIELDS[name]) return
    if (!lastRecord) return
    const prev = lastRecord[name]
    if (prev === undefined || prev === '' || prev === null || !isNum(prev) || Number(prev) <= 0) return
    if (!isNum(value)) return
    const max = Number(prev) * 5
    if (Number(value) > max) {
      const label = RANGE_FIELDS[name]
      setErrors(prev => ({
        ...prev,
        [name]: `Valor fuera de rango. El maximo permitido es ${max.toLocaleString('es-BO')} (5 veces el ultimo registro de ${label})`,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(form, plant, lastRecord)

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll al primer error
      setTimeout(() => {
        const el = formRef.current?.querySelector('.field-error')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    saveRecord({ ...form, planta: plant })
    setLastRecord(getLastRecord(plant))
    setForm(getInitialState(plant))
    setErrors({})
    setSaved(true)
    onSaved(`Registro guardado: ${PLANT_LABELS[plant]} — Turno ${form.turno}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setSaved(false), 3000)
  }

  // Shortcuts para no repetir tanto codigo
  const f = (name, label, hint, type, props = {}) => (
    <Field
      name={name}
      label={label}
      hint={hint}
      type={type || 'text'}
      value={form[name] ?? ''}
      onChange={handleChange}
      onBlur={RANGE_FIELDS[name] ? handleBlur : undefined}
      error={errors[name]}
      {...props}
    />
  )

  const s = (name, label, options, props = {}) => (
    <Select
      name={name}
      label={label}
      options={options}
      value={form[name] ?? ''}
      onChange={handleChange}
      error={errors[name]}
      {...props}
    />
  )

  // Helper para mostrar el ultimo valor
  const lastVal = (field) => {
    if (!lastRecord) return null
    const v = lastRecord[field]
    if (v === undefined || v === '' || v === null) return null
    return `Ultimo: ${v}`
  }

  const plantColor = PLANT_COLORS[plant] || '#1e3a5f'
  const plantLabel = PLANT_LABELS[plant] || plant
  const isCuarzo = plant === 'cuarzo'

  return (
    <div className="page">
      <header className="form-header" style={{ background: plantColor }}>
        <button className="btn-back" onClick={onBack} type="button">
          &#8592; Volver
        </button>
        <div className="form-header-title">
          <span className="form-header-label">Cierre de Turno</span>
          <span className="form-header-plant">{plantLabel}</span>
        </div>
      </header>

      {lastRecord && (
        <div className="last-record-banner">
          <strong>Ultimo registro guardado:</strong> {lastRecord.fecha} &mdash; Turno {lastRecord.turno} &mdash; {lastRecord.sop}
        </div>
      )}

      {saved && (
        <div className="saved-banner">
          Registro guardado correctamente. Puede ingresar otro registro.
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="shift-form">

        {/* ---- INFORMACION GENERAL ---- */}
        <SectionCard title="Informacion General">
          <div className="form-grid">
            {f('fecha', 'Fecha', null, 'date')}
            {s('turno', 'Turno', TURNO_OPTIONS)}
            {s('sop', 'SOP', SOP_OPTIONS)}
            {s('tipoMaterial', 'Tipo Material', MATERIAL_OPTIONS)}
          </div>
        </SectionCard>

        {/* ---- HORAS ---- */}
        <SectionCard title="Horas">
          <div className="form-grid">
            {f('horasProgramadas', 'Horas Programadas', 'Maximo 12 horas', 'number', { min: 0, max: 12, step: '0.5' })}
            {f('horasMantenimientoProgramado', 'Horas Mant. Programado', 'Entre 0 y 12 horas', 'number', { min: 0, max: 12, step: '0.5' })}
          </div>
        </SectionCard>

        {/* ---- MEDIDORES PLANTA ---- */}
        <SectionCard title="Medidores Planta">
          <div className="form-grid">
            {f('horometroPlanta', 'Horometro Planta', lastVal('horometroPlanta'), 'number', { min: 0, step: '0.1' })}
            {f('pesometroAlimentacion', 'Pesometro Alimentacion', lastVal('pesometroAlimentacion'), 'number', { min: 0, step: '0.1' })}
            {f('litrosPetroleo', 'Litros de Petroleo', null, 'number', { min: 0, step: '0.1' })}
            {f('horometroGenerador', 'Horometro Generador', lastVal('horometroGenerador'), 'number', { min: 0, step: '0.1' })}
            {f('kilosFloculante', 'Kilos de Floculante', null, 'number', { min: 0, step: '0.1' })}
          </div>
        </SectionCard>

        {/* ---- PRODUCCION (plantas estandar) ---- */}
        {!isCuarzo && (
          <SectionCard title="Produccion">
            <div className="form-grid">
              {f('pesometroProduccion', 'Pesometro Produccion', lastVal('pesometroProduccion'), 'number', { min: 0, step: '0.1' })}
              {f('flujo', 'Flujo (Ton/h)', null, 'number', { min: 0, step: '0.1' })}
              {f('numeroBolasM1', 'N de Bolas M1', null, 'number', { min: 0, step: '1' })}
              {f('numeroBolasM2', 'N de Bolas M2', null, 'number', { min: 0, step: '1' })}
            </div>
          </SectionCard>
        )}

        {/* ---- PRODUCCION CUARZO ---- */}
        {isCuarzo && (
          <SectionCard title="Produccion Cuarzo">
            <div className="form-grid">
              {f('pesometroProduccionCuarzo', 'Pesometro Prod. Cuarzo', lastVal('pesometroProduccionCuarzo'), 'number', { min: 0, step: '0.1' })}
              {f('pesometroProduccionArenas', 'Pesometro Prod. Arenas', lastVal('pesometroProduccionArenas') || 'Opcional', 'number', { min: 0, step: '0.1', required: false })}
              {f('horometroVSI', 'Horometro VSI', lastVal('horometroVSI'), 'number', { min: 0, step: '0.1' })}
              {f('litrosPetroleoVSI', 'Litros Petroleo VSI', null, 'number', { min: 0, step: '0.1' })}
            </div>
          </SectionCard>
        )}

        {/* ---- DETENCIONES OPERACIONALES ---- */}
        <SectionCard title="Detenciones Operacionales">
          <div className="detencion-grid">
            <div className="detencion-pair">
              <div className="detencion-pair-label">Detencion 1</div>
              {f('detencionOperacion1', 'Descripcion', null, 'text', { placeholder: 'Describa la detencion...' })}
              {f('tiempoDetencionOperacion1', 'Tiempo (min)', null, 'number', { min: 0, step: '1' })}
            </div>
            <div className="detencion-pair">
              <div className="detencion-pair-label">Detencion 2</div>
              {f('detencionOperacion2', 'Descripcion', null, 'text', { placeholder: 'Describa la detencion...' })}
              {f('tiempoDetencionOperacion2', 'Tiempo (min)', null, 'number', { min: 0, step: '1' })}
            </div>
          </div>
        </SectionCard>

        {/* ---- DETENCIONES MANTENCION ---- */}
        <SectionCard title="Detenciones de Mantencion">
          <div className="detencion-grid">
            <div className="detencion-pair">
              <div className="detencion-pair-label">Detencion 1</div>
              {f('detencionMantencion1', 'Descripcion', null, 'text', { placeholder: 'Describa la detencion...' })}
              {f('tiempoDetencionMantencion1', 'Tiempo (min)', null, 'number', { min: 0, step: '1' })}
            </div>
            <div className="detencion-pair">
              <div className="detencion-pair-label">Detencion 2</div>
              {f('detencionMantencion2', 'Descripcion', null, 'text', { placeholder: 'Describa la detencion...' })}
              {f('tiempoDetencionMantencion2', 'Tiempo (min)', null, 'number', { min: 0, step: '1' })}
            </div>
          </div>
        </SectionCard>

        {/* ---- ESTADO DEL REGISTRO ---- */}
        <SectionCard title="Estado del Registro">
          <div className="form-grid">
            {s('estado', 'Estado', ESTADO_OPTIONS)}
            {f('creadoPor', 'Creado Por', null, 'text', { placeholder: 'Nombre del operador' })}
          </div>
        </SectionCard>

        {/* ---- RESUMEN ERRORES ---- */}
        {Object.keys(errors).length > 0 && (
          <div className="error-summary">
            Hay {Object.keys(errors).length} campo(s) con error. Revise el formulario antes de guardar.
          </div>
        )}

        {/* ---- ACCIONES ---- */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onBack}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-save"
            style={{ background: plantColor }}
            disabled={Object.keys(errors).length > 0}
          >
            Guardar Registro
          </button>
        </div>

      </form>
    </div>
  )
}
