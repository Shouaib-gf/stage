const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const client = require('@prometheus-io/client');

dotenv.config({ path: './.env' });

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const busesConnected = new client.Gauge({
  name: 'smartbus_buses_connected',
  help: 'Number of buses currently connected to the SmartBus backend.',
  registers: [registry],
});
busesConnected.set(0);

const studentsDetected = new client.Counter({
  name: 'smartbus_students_detected_total',
  help: 'Number of student detection events processed by the SmartBus backend.',
  registers: [registry],
});

const httpRequestDuration = new client.Histogram({
  name: 'smartbus_http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

function createApp({ isDatabaseReady = () => mongoose.connection.readyState === 1 } = {}) {
  const app = express();

  app.use(cookieParser());
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const seconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
      const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
      httpRequestDuration.observe(
        { method: req.method, route, status_code: String(res.statusCode) },
        seconds,
      );
    });
    next();
  });

  app.get('/health', (req, res) => {
    if (!isDatabaseReady()) {
      return res.status(503).json({ status: 'unavailable', database: 'disconnected' });
    }
    return res.status(200).json({ status: 'ok', database: 'connected' });
  });

  app.get('/metrics', async (req, res, next) => {
    try {
      res.set('Content-Type', registry.contentType);
      res.end(await registry.metrics());
    } catch (error) {
      next(error);
    }
  });

  const { swaggerUI, swaggerSpec } = require('./config/swagger');
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  app.use('/api/session', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/agencies', require('./routes/agencyRoutes.js'));
  app.use('/api/routes', require('./routes/routeRoutes'));
  app.use('/api/trips', require('./routes/tripRoutes'));
  app.use('/api/stops', require('./routes/stopRoutes'));
  app.use('/api/stopTimes', require('./routes/stopTimesRoutes'));
  app.use('/api/calendars', require('./routes/calendarRoutes.js'));
  app.use('/api/shapes', require('./routes/shapeRoutes.js'));
  app.use('/api/userpermission', require('./routes/permissionRoutes.js'));
  app.use('/api/vehicle-assignments', require('./routes/VehicleAssignementRoutes.js'));
  app.use('/api/vehicles', require('./routes/vehicleRoutes'));
  app.use('/api/drivers', require('./routes/driverRoutes'));
  app.use('/api/students', require('./routes/studentRoutes'));
  app.use('/api/messages', require('./routes/messageRoutes'));

  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  return app;
}

module.exports = {
  createApp,
  registry,
  busesConnected,
  studentsDetected,
};
