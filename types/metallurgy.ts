import { ID, ISO8601Date } from './common.ts';
import { QualityStatus } from './enums.ts';

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

export interface SteelBatchMetadata {
  batchNumber: string;
  grade: string;        // ex: SAE 1020, ASTM A36
  invoiceNumber: string;
  
  // Fluxo de Envio (Vital)
  sentAt?: ISO8601Date;
  sentBy?: string;

  // Análise Documental (Cliente)
  status: QualityStatus;
  documentalFlags?: string[];
  documentalObservations?: string;
  inspectedAt?: ISO8601Date;
  inspectedBy?: string;
  // Fix: added rejectionReason field to support technical audit logs and timeline display
  rejectionReason?: string;

  // Análise Física (Cliente)
  physicalStatus?: QualityStatus;
  physicalFlags?: string[];
  physicalObservations?: string;
  physicalInspectedAt?: ISO8601Date;
  physicalInspectedBy?: string;
  physicalEvidenceUrl?: string;

  clientObservations?: string; 
  clientFlags?: string[];      
  viewedAt?: ISO8601Date;      
  viewedBy?: string;
  // Fix: added client interaction tracking fields
  lastClientInteractionAt?: ISO8601Date;
  lastClientInteractionBy?: string;

  chemicalComposition: ChemicalComposition;
  mechanicalProperties: MechanicalProperties;
}
