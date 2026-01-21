/**
 * CONSTANTES INDUSTRIAIS - AÇOS VITAL
 * Definições técnicas baseadas em normas ISO/ASTM para validação automática.
 */

export const STEEL_GRADES = [
  'SAE 1010', 'SAE 1020', 'SAE 1045', 
  'ASTM A36', 'ASTM A572 GR50', 
  'ST 52.3', 'A106 GR B'
] as const;

export const CHEMICAL_ELEMENTS = {
  C: { label: 'Carbono', symbol: 'C', unit: '%' },
  Mn: { label: 'Manganês', symbol: 'Mn', unit: '%' },
  Si: { label: 'Silício', symbol: 'Si', unit: '%' },
  P: { label: 'Fósforo', symbol: 'P', unit: '%' },
  S: { label: 'Enxofre', symbol: 'S', unit: '%' },
} as const;

export const MECHANICAL_TESTS = {
  YIELD: { label: 'Escoamento', unit: 'MPa' },
  TENSILE: { label: 'Resistência', unit: 'MPa' },
  ELONGATION: { label: 'Alongamento', unit: '%' },
} as const;

export const APP_CONFIG = {
  TIMEOUT_MS: 8000,
  MAX_FILE_SIZE_MB: 15,
  SUPPORTED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};