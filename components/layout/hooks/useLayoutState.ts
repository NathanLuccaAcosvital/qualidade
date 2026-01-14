
import { useState, useCallback } from 'react';

export const useLayoutState = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => 
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  
  const openPrivacy = useCallback(() => setIsPrivacyOpen(true), []);
  const closePrivacy = useCallback(() => setIsPrivacyOpen(false), []);
  
  const openChangePassword = useCallback(() => setIsChangePasswordOpen(true), []);
  const closeChangePassword = useCallback(() => setIsChangePasswordOpen(false), []);

  return {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    isPrivacyOpen,
    openPrivacy,
    closePrivacy,
    isChangePasswordOpen,
    openChangePassword,
    closeChangePassword
  };
};
