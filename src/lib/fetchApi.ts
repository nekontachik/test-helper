export const fetchApi = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('API request failed');
  return response.json();
};
