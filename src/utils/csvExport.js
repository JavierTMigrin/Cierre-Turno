const COLUMN_ORDER = [
  'planta',
  'fecha',
  'turno',
  'sop',
  'tipoMaterial',
  'horasProgramadas',
  'horasMantenimientoProgramado',
  'horometroPlanta',
  'pesometroAlimentacion',
  'litrosPetroleo',
  'horometroGenerador',
  'kilosFloculante',
  'detencionOperacion1',
  'tiempoDetencionOperacion1',
  'detencionOperacion2',
  'tiempoDetencionOperacion2',
  'detencionMantencion1',
  'tiempoDetencionMantencion1',
  'detencionMantencion2',
  'tiempoDetencionMantencion2',
  'pesometroProduccion',
  'numeroBolasM1',
  'numeroBolasM2',
  'flujo',
  'pesometroProduccionCuarzo',
  'pesometroProduccionArenas',
  'horometroVSI',
  'litrosPetroleoVSI',
  'estado',
  'creadoPor',
  'fechaRegistro',
  'id',
]

const COLUMN_LABELS = {
  planta: 'Planta',
  fecha: 'Fecha',
  turno: 'Turno',
  sop: 'SOP',
  tipoMaterial: 'Tipo Material',
  horasProgramadas: 'Horas Programadas',
  horasMantenimientoProgramado: 'Horas Mant. Programado',
  horometroPlanta: 'Horometro Planta',
  pesometroAlimentacion: 'Pesometro Alimentacion',
  litrosPetroleo: 'Litros Petroleo',
  horometroGenerador: 'Horometro Generador',
  kilosFloculante: 'Kilos Floculante',
  detencionOperacion1: 'Detencion Operacion 1',
  tiempoDetencionOperacion1: 'Tiempo Det. Op. 1 (min)',
  detencionOperacion2: 'Detencion Operacion 2',
  tiempoDetencionOperacion2: 'Tiempo Det. Op. 2 (min)',
  detencionMantencion1: 'Detencion Mantencion 1',
  tiempoDetencionMantencion1: 'Tiempo Det. Mant. 1 (min)',
  detencionMantencion2: 'Detencion Mantencion 2',
  tiempoDetencionMantencion2: 'Tiempo Det. Mant. 2 (min)',
  pesometroProduccion: 'Pesometro Produccion',
  numeroBolasM1: 'N Bolas M1',
  numeroBolasM2: 'N Bolas M2',
  flujo: 'Flujo (Ton/h)',
  pesometroProduccionCuarzo: 'Pesometro Prod. Cuarzo',
  pesometroProduccionArenas: 'Pesometro Prod. Arenas',
  horometroVSI: 'Horometro VSI',
  litrosPetroleoVSI: 'Litros Petroleo VSI',
  estado: 'Estado',
  creadoPor: 'Creado Por',
  fechaRegistro: 'Fecha Registro',
  id: 'ID',
}

export const exportToCSV = (records) => {
  if (!records || records.length === 0) {
    alert('No hay registros para exportar.')
    return
  }

  const headers = COLUMN_ORDER.map(k => COLUMN_LABELS[k] || k)

  const rows = records.map(record =>
    COLUMN_ORDER.map(key => {
      const val = record[key] !== undefined ? record[key] : ''
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(';')
  )

  const csv = [headers.join(';'), ...rows].join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `registros_turno_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
