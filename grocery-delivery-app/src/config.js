// =============================================
//  CENTRAL API CONFIG — FreshCart Delivery App
// =============================================

const hostname = window.location.hostname;

const API_BASE = (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)
)
    ? `http://${hostname}:8000`
    : import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default API_BASE;
