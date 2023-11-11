import  express from 'express';
import AuthRoutes from './authRouter.js';
import RideRoutes from './rideRouter.js';
import responseMiddleware from '../../middlewares/response.js';

const router = (app) => {
    const appRoutes = express.Router();
    responseMiddleware(app);
    appRoutes.get('/health-check', (req, res) => res.status(200).json({ status: true }));
    app.use("/api/auth", AuthRoutes);
    app.use("/api/rides", RideRoutes);

};

export default router;