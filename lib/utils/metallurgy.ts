import { ChemicalComposition } from '../../types/metallurgy.ts';

/**
 * MOTOR DE CÁLCULO METALÚRGICO
 * Implementa fórmulas técnicas para validação de certificados.
 */

/**
 * Calcula o Carbono Equivalente (CE) - Fórmula Padrão IIW
 * CE = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15
 */
export const calculateCarbonEquivalent = (chem: ChemicalComposition): number => {
  const { carbon, manganese } = chem;
  // Simplificado para os elementos básicos rastreados
  return carbon + (manganese / 6);
};

/**
 * Valida se a composição química está dentro dos limites de segurança Vital.
 */
export const validateChemicalCompliance = (chem: ChemicalComposition): { isValid: boolean; alerts: string[] } => {
  const alerts: string[] = [];
  
  if (chem.carbon > 0.30) alerts.push("Carbono acima do limite de soldabilidade convencional");
  if (chem.sulfur > 0.05) alerts.push("Enxofre elevado: risco de fragilidade a quente");
  if (chem.phosphorus > 0.04) alerts.push("Fósforo elevado: risco de redução de tenacidade");

  return {
    isValid: alerts.length === 0,
    alerts
  };
};