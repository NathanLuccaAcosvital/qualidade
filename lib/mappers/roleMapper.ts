
import { UserRole } from '../../types/auth.ts';

/**
 * Role Mapper Utility (Resilient)
 * Mapeia variações de strings do banco para o Enum de domínio.
 */
export const normalizeRole = (role: unknown): UserRole => {
    if (!role) return UserRole.QUALITY;
    
    const normalized = String(role).trim().toUpperCase();
    
    // Mapeamento robusto para operação interna da Aços Vital
    // Added CLIENT and CLIENTE mappings
    const roleMap: Record<string, UserRole> = {
        'ADMIN': UserRole.ADMIN,
        'ADMINISTRADOR': UserRole.ADMIN,
        'QUALITY': UserRole.QUALITY,
        'QUALIDADE': UserRole.QUALITY,
        'ANALISTA': UserRole.QUALITY,
        'CLIENT': UserRole.CLIENT,
        'CLIENTE': UserRole.CLIENT
    };

    return roleMap[normalized] || UserRole.QUALITY;
};
