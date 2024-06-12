import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'node:fs';

@Injectable()
export class R2Service {
	private S3: S3Client;
	private bucket: string;

	constructor(private readonly configService: ConfigService) {
		this.S3 = new S3Client({
			region: 'apac',
			endpoint: `https://${this.configService.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: this.configService.get('R2_ACCESS_KEY_ID'),
				secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
			},
		});
		this.bucket = this.configService.get('R2_BUCKET');
	}

	// 上传单个文件至 Cloudflare R2
	uploadFileToR2 = (filePath: string, targetPath: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const putCommand = new PutObjectCommand({
				Bucket: this.bucket,
				Key: targetPath,
				Body: fs.createReadStream(filePath),
			});
			this.S3.send(putCommand)
				.then(() => {
					resolve(`https://${this.configService.get('R2_DOMAIN')}/${targetPath}`);
					fs.unlinkSync(filePath);
				})
				.catch((error) => {
					reject(error);
				});
		});
	};

	// 删除 Cloudflare R2 中的文件
	deleteFileFromR2 = (targetPath: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			const deleteCommand = new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: targetPath,
			});
			this.S3.send(deleteCommand)
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		});
	};
}
