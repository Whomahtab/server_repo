import express from "express";
import Route from "./Routes/user.js";
import globalErrorHandler from "./middleware/ErrorHandler.js";
import cors from "cors";
import helmet from "helmet";
import AdminRoute from "./Routes/adminRoute.js";
import rateLimit from "express-rate-limit";
const app = express();

app.use(express.json())
app.use(helmet())
app.disable('x-powered-by');

const corsOptions = {
    origin: "*",
}

// Limit each IP to 100 requests  windowMs
const globalLimiter = rateLimit({
    //window  MS => 10 minutes
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please try again later.',
});
app.use(globalLimiter)



app.use(cors(corsOptions))
//Client_API || User API
app.use('/api', Route)
// Admin_API
app.use('/api/admin', AdminRoute)

app.get('/', (req, res, next) => {
    res.json({ msg: "working...." })
})



// Error handling middleware
app.use(globalErrorHandler);


export default app