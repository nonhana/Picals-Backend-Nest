import * as shelljs from 'shelljs';

shelljs.cp('-R', '.env', 'dist');
shelljs.cp('-R', 'uploads', 'dist');
