import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { hanaError } from 'src/error/hanaError';

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		try {
			fs.mkdirSync(path.join(process.cwd(), 'uploads'));
		} catch (e) {
			if (e.code !== 'EEXIST') {
				throw new hanaError(11001, e.message);
			}
		}
		cb(null, path.join(process.cwd(), 'uploads'));
	},
	filename: function (req, file, cb) {
		const uniqueSuffix =
			Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname;
		cb(null, file.fieldname + '-' + uniqueSuffix);
	},
});

export { storage };
