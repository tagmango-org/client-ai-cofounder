export const getRefreshTokenFromURL = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refreshToken = urlParams.get('refreshToken') || urlParams.get('accessToken');
    console.log('🔑 Extracted token from URL:', refreshToken ? 'Token found' : 'No token found');
    return refreshToken;
  } catch (error) {
    console.error("Error extracting token from URL:", error);
    return null;
  }
};

