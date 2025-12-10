import {app} from './app.js';
import dotenv from 'dotenv';
import 'dotenv/config'; 
dotenv.config();

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`API http://localhost:${port}`));