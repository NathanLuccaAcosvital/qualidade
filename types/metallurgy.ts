
import { ID, ISO8601Date } from './common.ts';

/**
 * Domínio Técnico - Metalurgia (Core Business)
 */

export interface ChemicalComposition {
  carbon: number;      // % C
  manganese: number;   // % Mn
  silicon: number;     // % Si
  phosphorus: number;  // % P
  sulfur: number;      // % S
}

export interface MechanicalProperties {
  yieldStrength: number;    // MPa (Escoamento)
  tensileStrength: number;  // MPa (Resistência)
  elongation: number;       // %   (Alongamento)
}

export enum QualityStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export interface SteelBatchMetadata {
  batchNumber: string;
  grade: string;        // ex: SAE 1020, ASTM A36
  invoiceNumber: string;
  status: QualityStatus;
  rejectionReason?: string;
  inspectedAt?: ISO8601Date;
  inspectedBy?: string;
  chemicalComposition: ChemicalComposition;
  mechanicalProperties: MechanicalProperties;
}
