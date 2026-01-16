import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { qualityService } from '../../../../lib/services/index.ts';
import { ClientOrganization } from '../../../../types/index.ts';

export const useQualityPortfolio = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQualityData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Agora, este hook busca APENAS o portfólio de clientes
      const portfolio = await qualityService.getManagedPortfolio(user.id);
      setClients(portfolio);
    } catch (err) {
      console.error("Quality Context Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQualityData();
  }, [loadQualityData]);

  return { clients, isLoading, refresh: loadQualityData };
};