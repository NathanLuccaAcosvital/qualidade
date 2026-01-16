
import { ID, ISO8601Date } from './common.ts';
import { QualityStatus, UserRole } from './enums.ts';

/**
 * Domínio Técnico - Metalurgia (Core Business)
 */

// Novos tipos para o sistema de conversação
type ConversationParty = UserRole.QUALITY | UserRole.CLIENT;

export interface ConversationMessage {
  id: string;
  senderRole: ConversationParty;
  senderName: string;
  timestamp: string;
  message: string;
}

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
  rejectionReason?: string;

  // Análise Física (Cliente)
  physicalStatus?: QualityStatus;
  physicalFlags?: string[];
  physicalObservations?: string;
  physicalEvidenceUrls?: string[]; // Adicionado para suportar múltiplas URLs
  physicalInspectedAt?: ISO8601Date;
  physicalInspectedBy?: string;

  clientObservations?: string; 
  clientFlags?: string[];      
  viewedAt?: ISO8601Date;      
  viewedBy?: string;
  lastClientInteractionAt?: ISO8601Date;
  lastClientInteractionBy?: string;

  chemicalComposition: ChemicalComposition;
  mechanicalProperties: MechanicalProperties;

  // Novos campos para o fluxo de conversação
  conversationLog?: ConversationMessage[];
  currentConversationTurn?: ConversationParty | 'NONE'; // 'NONE' se resolvida ou não iniciada
  conversationTurnCount?: number; // Contador de respostas do QUALITY em um ciclo de conversa
}
