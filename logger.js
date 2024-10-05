const winston = require('winston')
const fs = require('fs')
const path = require('path')
const logdir = 'log';

if (!fs.existsSync(logdir)) {
    fs.mkdirSync(logdir)
}
const { combine, timestamp, json, prettyPrint, errors } = winston.format


winston.loggers.add('UserLogger', {
    level: 'info',
    format: combine(
        errors({ stack: true }),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports: [new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logdir, 'userLog.log') }),
    ],
})

winston.loggers.add('CatLogger', {
    level: 'info',
    format: combine(
        errors({ stack: true }),
        timestamp(),
        json(),
        prettyPrint()
    ),

    transports: [new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logdir, 'catLog.log') }),
    ],
})



