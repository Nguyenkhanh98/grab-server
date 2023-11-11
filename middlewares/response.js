import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import _ from  'lodash';
import logger  from '../services/logger/index.js';

const reponseMiddleware=  (app) => {
  app.use((req, res, next) => {
    // const ip = utility.getIpAddress(req);

    res.success = (data = null, code = StatusCodes.OK, message = 'Request successful') => {
      // convert data if it isnt object
      if (typeof data !== 'object') {
        data = { data };
      }
      if (Array.isArray(data)) {
        data = { data };
      }
      // only send message with get method when allow
      const body = { ...req.body };

      logger.info(
        `Service: Grab  - Method: ${req.method} - API: ${req.path} - IP :  - headers: ${JSON.stringify(req.headers)} - Host: ${req.hostname} - Status: ${code} - ${JSON.stringify(body)}
        `,
      );
      const json = { status: true, message, ...data };
      if (req.adminAccount && req.adminAccount.isTokenExpired !== undefined) {
        json.isTokenExpired = req.adminAccount.isTokenExpired;
      }
      return res.status(code).json(json);
    };
    res.error = (code = StatusCodes.INTERNAL_SERVER_ERROR, message = 'Request fail') => {
      logger.error(
        `
        Service: Grab - Host: ${req.hostname}
        Method: ${req.method}
        API: ${req.url}
        Body: ${JSON.stringify(req.body)}
        Message: ${message}
        `,
      );
      return res.status(code).json({ status: false, message });
    };
    next();
  });
};

export default reponseMiddleware;