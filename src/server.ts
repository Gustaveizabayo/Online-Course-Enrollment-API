import { app } from './app';
import { config } from './config/env';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`íº€ Server running on port ${PORT}`);
  console.log(`í³š API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`í¹º Health check: http://localhost:${PORT}/health`);
});
