import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente utilitário que garante que o usuário retorne ao topo
 * sempre que a rota ou os parâmetros de busca mudarem.
 * Lida com scroll global e containers internos de dashboard.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Reset do scroll da janela global
    window.scrollTo(0, 0);

    // 2. Reset de containers internos de scroll (comuns em dashboards com sidebar fixa)
    // Procuramos por elementos 'main' ou divs que tenham a classe de overflow do Tailwind
    const scrollableElements = document.querySelectorAll('.overflow-y-auto, main');
    scrollableElements.forEach((el) => {
      el.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [pathname, search]);

  return null;
};