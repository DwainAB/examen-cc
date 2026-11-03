// Journalisation structurée en JSON sur la sortie standard, collectée par Railway ou Docker
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  silent: process.env.LOG_LEVEL === 'silent',
  defaultMeta: { service: 'backend', env: process.env.NODE_ENV || 'development' },
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
