import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Batuta Orders Management System')
});

app.listen(process.env.PORT, async () => {
  console.log(`Server on port ${process.env.PORT}`);
});
