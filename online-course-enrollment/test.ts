console.log("Starting test...");
import express from 'express';
const app = express();
app.get('/', (_req: express.Request, res: express.Response) => {
    res.send('OK');
});
const port = 3001;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    server.close();
    process.exit(0);
});
