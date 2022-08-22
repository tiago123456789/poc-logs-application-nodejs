const express = require("express")
const morgan = require("morgan")
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'app-example-logging-service' },
    transports: [
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/all.log', level: 'info' }),
        new winston.transports.Console({ level: 'info' }),
    ],
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
}

const app = express();

app.use(morgan("combined", { stream: logger.stream }))


app.get("/", (req, res) => res.json({ message: "hi world!!!" }))

app.get("/test", (req, res) => res.json({ message: "Route test" }))


app.get("/error", (req, res, next) => {
    try {
        throw new Error("Error to generate error log")
    } catch (error) {
        next(error);
    }
})

app.use((err, req, res, next) => {
    logger.error(err.message)
    res.status(500).json({
        message: "Internal server error"
    })
})

app.listen(3000, () => {
    console.log('Server is running')
})