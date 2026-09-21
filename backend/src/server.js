require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Manufacturing & Traceability Management API is running`);
  console.log(`Port: ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
