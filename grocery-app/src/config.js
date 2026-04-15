// =============================================
//  CENTRAL API CONFIG — FreshCart Consumer App
// =============================================
// Jab local PC pe kaam karo:
//   VITE_API_BASE = http://localhost:8000
//
// Jab --host se phone pe test karo:
//   VITE_API_BASE = http://10.253.48.105:8000
//
// Is file ko mat chhedo — .env file se control hoga
// =============================================

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default API_BASE;
