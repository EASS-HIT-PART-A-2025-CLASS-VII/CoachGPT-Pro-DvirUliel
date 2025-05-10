import axios from "axios";

const CACHE_SERVICE_URL = process.env.CACHE_SERVICE_URL || "http://localhost:8001";

export async function getCachedResponse(key) {
  try {
    const res = await axios.get(`${CACHE_SERVICE_URL}/cache`, { params: { key } });
    return res.data?.value || null;
  } catch (err) {
    console.error("Cache miss or error", err.message);
    return null;
  }
}

export async function setCachedResponse(key, value, ttl = 3600) {
  try {
    await axios.post(`${CACHE_SERVICE_URL}/cache`, { key, value, ttl });
  } catch (err) {
    console.error("Cache set failed", err.message);
  }
}
