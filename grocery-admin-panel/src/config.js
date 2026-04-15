const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://api.yourdomain.com'; // Change this line to your production backend URL

export default API_BASE;
