import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { hanaError } from 'src/error/hanaError';

const MultipleImgsInterceptor = FilesInterceptor('images', 50, {
	storage: multer.diskStorage({
		destination: (_, __, cb) => {
			const uploadPath = path.join(process.cwd(), 'uploads');
			fs.mkdirSync(uploadPath, { recursive: true });
			cb(null, uploadPath);
		},
		filename: (_, file, cb) => {
			const uniqueSuffix =
				Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname;
			cb(null, file.fieldname + '-' + uniqueSuffix);
		},
	}),
	fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new hanaError(11002));
		}
	},
	limits: {
		fileSize: 1024 * 1024 * 10, // 单个文件的最大尺寸
	},
});

export { MultipleImgsInterceptor };
