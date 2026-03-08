export const PLANTS = [
  { id: 'arenas',  label: 'Arenas',   color: '#1e3a5f', abbr: 'AR' },
  { id: 'cuarzo',  label: 'Cuarzo',   color: '#2563a8', abbr: 'CZ' },
  { id: 'lavadoP', label: 'Lavado P', color: '#276749', abbr: 'LP' },
  { id: 'secadoP', label: 'Secado P', color: '#553c9a', abbr: 'SP' },
  { id: 'lavadoT', label: 'Lavado T', color: '#c05621', abbr: 'LT' },
  { id: 'secadoT', label: 'Secado T', color: '#97266d', abbr: 'ST' },
]

export const PLANT_LABELS = Object.fromEntries(PLANTS.map(p => [p.id, p.label]))

export const PLANT_COLORS = Object.fromEntries(PLANTS.map(p => [p.id, p.color]))

export const SOP_OPTIONS = [
  'Alejandro Jofre',
  'Cristian Ayala',
  'Jorge Hernandez',
  'Diego Aguilera',
  'Nicolas Merino',
  'Benjamin Veliz',
]

export const MATERIAL_OPTIONS = ['A36', 'Alta Hierro', 'Producto Especial']

export const TURNO_OPTIONS = ['A', 'B', 'C']

export const ESTADO_OPTIONS = ['En revision', 'Cerrado']
