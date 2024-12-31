import app from "./src/app.js";
import connectDb from "./src/config/db.js";
import { config } from "./src/config/_config.js";

// Set Default Port in case Of Failure
const PORT = config.APP_PORT || 3002

// Connect With Database
try {
    connectDb();
} catch (error) {
    console.log(error.message);
}


// app Running on Defined PORT..
app.listen(PORT, '0.0.0.0', () => {
    console.log(`App is Running On Port  http://localhost:${PORT} `);
})