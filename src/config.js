const config = {
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://portfolio-backend1-fcev.onrender.com/api'
    : 'http://localhost:5000/api'
};

export default config;