import { getSession } from 'next-auth/react';

const apiClient = {
  async get<T>(url: string): Promise<T> {
    const session = await getSession();
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put<T>(url: string, data: any): Promise<T> {
    const session = await getSession();
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Add other methods (post, delete) as needed
}

export default apiClient
