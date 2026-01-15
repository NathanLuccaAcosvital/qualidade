
import { useState, useCallback } from 'react';

export const useLayoutState = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => 
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Removed isPrivacyOpen, openPrivacy, closePrivacy, isChangePasswordOpen, openChangePassword, closeChangePassword
  // const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false); // Removido

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  
  // Removed privacy and change password handlers as they are now handled by ConfigPage
  // const openPrivacy = useCallback(() => setIsPrivacyOpen(true), []);
  // const closePrivacy = useCallback(() => setIsPrivacyOpen(false), []);
  
  // const openChangePassword = useCallback(() => setIsChangePasswordOpen(true), []);
  // const closeChangePassword = useCallback(() => setIsChangePasswordOpen(false), []);

  // const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []); // Removido
  // const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []); // Removido

  return {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    // isPrivacyOpen, // Removido
    // openPrivacy,   // Removido
    // closePrivacy,  // Removido
    // isChangePasswordOpen, // Removido
    // openChangePassword,   // Removido
    // closeChangePassword   // Removido
    // isCommandPaletteOpen, // Removido
    // openCommandPalette,   // Removido
    // closeCommandPalette   // Removido
  };
};