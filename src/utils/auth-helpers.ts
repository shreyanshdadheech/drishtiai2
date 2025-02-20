interface TokenResponse {
  access: string;
  refresh: string;
}

const loginAndGetTokens = async (): Promise<TokenResponse | null> => {
  const email = localStorage.getItem('email');
  const password = localStorage.getItem('password');

  if (!email || !password) {
    return null;
  }

  const response = await fetch('https://bioscanai.com/drishti/api/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data: TokenResponse = await response.json();
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  
  return data;
};

export const getNewAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://bioscanai.com/drishti/api/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // If refresh fails, try to login again
      console.log('Token refresh failed, attempting re-authentication...');
      const loginResponse = await loginAndGetTokens();
      if (!loginResponse) {
        throw new Error('Re-authentication failed');
      }
      return loginResponse.access;
    }

    const data: TokenResponse = await response.json();
    return data.access;
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication failed. Please login again.');
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return await getNewAccessToken();
  
  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    
    if (Date.now() >= expirationTime - 10000) { // Refresh if within 10 seconds of expiry
      return await getNewAccessToken();
    }
    
    return accessToken;
  } catch (error) {
    return await getNewAccessToken();
  }
};
