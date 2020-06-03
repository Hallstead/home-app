import express from 'express';
import bodyParser from 'body-parser';
import { db } from './daos/db';
import { peopleRouter } from './routers/people-router';

const app = express();

const port = process.env.port || 3001;
app.set('port', port);

/*
    ? Middleware Registration
*/
app.use(bodyParser.json());

/*
    ? Router Registration
*/
app.use('/people', peopleRouter);
app.use('/shutdown', (request, response, next) => {
    if (request.ip != "::ffff:172.31.45.201") {
        response.send("Sender is not authorized to perform this task.");
        next();
    } else {
        process.exit(0);
    }
});

/*
    Listen for SIGINT signal - issued by closing the server with ctrl+c
    This releases the database connections prior to app being stopped
*/
// process.on('SIGINT', () => {
//     db.end().then(() => {
//         console.log('Database pool closed');
//     });
// });

process.on('unhandledRejection', () => {
    db.end().then(() => {
        console.log('Database pool closed');
    });
});

app.listen(port, () => {
    console.log(`Home app running at http://localhost:${port}`);
});