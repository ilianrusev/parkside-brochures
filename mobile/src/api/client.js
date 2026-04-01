const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchParksidePages() {
  const res = await fetch(`${API_BASE_URL}/pages`);
  if (!res.ok) {
    throw new Error(`Failed to fetch pages: ${res.status}`);
  }
  return res.json();
}
