import 'dotenv/config';
import express from 'express';
import './config/firebase';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', authRouter);

app.get('/', (_, res) => {
  res.json({ message: 'Lucid Dreaming App API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
