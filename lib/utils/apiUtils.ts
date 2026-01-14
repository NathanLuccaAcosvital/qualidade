// lib/utils/apiUtils.ts
/**
 * Envolve uma Promise com um tempo limite.
 * Se a Promise não resolver dentro do `ms` especificado, ela será rejeitada com um erro de timeout.
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Request timed out'
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>; // Usado para limpar o timeout
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });

  try {
    // Corrige a Promise original e a Promise de timeout
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    // Garante que o timeout seja limpo assim que uma das Promises resolver
    clearTimeout(timeoutId);
  }
};