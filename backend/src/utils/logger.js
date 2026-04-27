/**
 * Structured logger utility.
 * Replaces scattered console.log/error with level-based, timestamped logging.
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

const timestamp = () => new Date().toISOString();

const formatMessage = (level, context, message, data) => {
  const base = `[${timestamp()}] [${level.toUpperCase()}]`;
  const ctx = context ? ` [${context}]` : '';
  const msg = ` ${message}`;
  return { text: `${base}${ctx}${msg}`, data };
};

const logger = {
  debug(context, message, data = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.debug) {
      const { text, data: d } = formatMessage('debug', context, message, data);
      d ? console.debug(text, d) : console.debug(text);
    }
  },

  info(context, message, data = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.info) {
      const { text, data: d } = formatMessage('info', context, message, data);
      d ? console.log(text, d) : console.log(text);
    }
  },

  warn(context, message, data = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.warn) {
      const { text, data: d } = formatMessage('warn', context, message, data);
      d ? console.warn(text, d) : console.warn(text);
    }
  },

  error(context, message, error = null) {
    if (CURRENT_LEVEL <= LOG_LEVELS.error) {
      const { text } = formatMessage('error', context, message);
      if (error instanceof Error) {
        console.error(text, { message: error.message, stack: error.stack });
      } else if (error) {
        console.error(text, error);
      } else {
        console.error(text);
      }
    }
  },
};

export default logger;
