/**
 * FORMATADORES VITAL
 * Utilitários para exibição padronizada de dados industriais.
 */

export const formatCNPJ = (cnpj: string): string => {
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/^(\md{2})(\md{3})(\md{3})(\md{4})(\md{2})$/, "$1.$2.$3/$4-$5");
};

export const formatWeight = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} t`;
  }
  return `${kg.toLocaleString('pt-BR')} kg`;
};

export const formatDateIndustrial = (date: string | null): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTechnicalValue = (value: number | undefined): string => {
  if (value === undefined) return '--';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};