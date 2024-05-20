import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as COS from 'cos-nodejs-sdk-v5';
import * as fs from 'node:fs';

@Injectable()
export class CosService {
	private cos: COS;
	private bucket: string;

	constructor(private readonly configService: ConfigService) {
		this.cos = new COS({
			SecretId: this.configService.get('COS_SECRETID'),
			SecretKey: this.configService.get('COS_SECRETKEY'),
		});
		this.bucket = this.configService.get('COS_BUCKET');
	}

	// 上传单个文件至腾讯云COS
	uploadFileToCos = (filePath: string, targetPath: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			this.cos.putObject(
				{
					Bucket: this.bucket, // 必须
					Region: 'ap-shanghai', // 必须
					Key: targetPath, // 必须
					Body: fs.createReadStream(filePath), // 必须
					ContentLength: fs.statSync(filePath).size,
				},
				(error, data) => {
					if (error) {
						reject(error);
					} else {
						resolve('https://' + data.Location);
						// 成功上传后删除本地文件
						fs.unlinkSync(filePath);
					}
				},
			);
		});
	};

	// 删除腾讯云COS中的文件
	deleteFileFromCos = (targetPath: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			this.cos.deleteObject(
				{
					Bucket: this.bucket,
					Region: 'ap-shanghai',
					Key: targetPath,
				},
				(error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				},
			);
		});
	};
}
