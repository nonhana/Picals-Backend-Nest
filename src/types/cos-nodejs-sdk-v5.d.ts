declare module 'cos-nodejs-sdk-v5' {
	export type BucketACL = 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';

	export type BucketRegion =
		| 'ap-beijing-1'
		| 'ap-beijing'
		| 'ap-nanjing'
		| 'ap-shanghai'
		| 'ap-guangzhou'
		| 'ap-chengdu'
		| 'ap-chongqing';

	export type BucketObjectACL =
		| 'default'
		| 'private'
		| 'public-read'
		| 'authenticated-read'
		| 'bucket-owner-read'
		| 'bucket-owner-full-control';

	export interface COSOptions {
		SecretId: string;
		SecretKey: string;
		FileParallelLimit?: number;
		ChunkParallelLimit?: number;
		ChunkSize?: number;
		SliceSize?: number;
		CopyChunkParallelLimit?: number;
		CopyChunkSize?: number;
		ProgressInterval?: number;
		Protocol?: string;
		ServiceDomain?: string;
		Domain?: string;
		UploadQueueSize?: number;
		ForcePathStyle?: boolean;
		UploadCheckContentMd5?: boolean;
		Timeout?: number;
		KeepAlive?: boolean;
		StrictSsl?: boolean;
		Proxy?: string;
		getAuthorization?: (
			options: {
				Method: string;
				Pathname: string;
				Key: string;
				Query: {
					[key: string]: string;
				};
				Headers: {
					[key: string]: string;
				};
			},
			cb: (data: {
				TmpSecretId: string;
				TmpSecretKey: string;
				XCosSecurityToken?: string;
				StartTime?: string;
				ExpiredTime?: string;
			}) => void,
		) => void;
	}

	export interface BucketListOptions {
		Region: BucketRegion;
	}

	export interface COSResult {
		statusCode: number;
		headers: {
			'content-type': string;
			'content-length': string;
			connection: string;
			date: string;
			server: string;
			'x-cos-request-id': string;
		};
	}

	export interface COSError extends COSResult {
		error: string;
	}

	export interface BucketResult {
		Name: string;
		Location: string;
		CreationDate: string;
	}

	export interface BucketListResult extends COSResult {
		Owner: {
			ID: string;
			DisplayName: string;
		};
		Buckets: [];
	}

	export interface CreateBucketOptions {
		Bucket: string;
		Region: BucketRegion;
		ACL?: BucketACL;
		GrantRead?: string;
		GrantWrite?: string;
		GrantReadAcp?: string;
		GrantWriteAcp?: string;
		GrantFullControl?: string;
	}

	export interface CreateBucketResult extends COSResult {
		Location: string;
	}

	export interface BucketOptions {
		Bucket: string;
		Region: BucketRegion;
	}

	export interface BucketACLOptions {
		Bucket: string;
		Region: BucketRegion;
		ACL: BucketACL;
		GrantRead?: string;
		GrantWrite?: string;
		GrantReadAcp?: string;
		GrantWriteAcp?: string;
		GrantFullControl?: string;
		AccessControlPolicy?: object;
	}

	export interface BucketACLDetailResult extends COSResult {
		ACL: string;
		GrantRead?: string;
		GrantWrite?: string;
		GrantReadAcp?: string;
		GrantWriteAcp?: string;
		GrantFullControl?: string;
		Owner: {
			ID: string;
			DisplayName: string;
		};
		Grants: {
			Permission: string;
			Grantee: {
				ID: string;
				URI: string;
				DisplayName: string;
			};
		}[];
	}

	export interface BucketContentsOptions {
		Bucket: string;
		Region: BucketRegion;
		Prefix?: string;
		Delimiter?: string;
		Marker?: string;
		MaxKeys?: string;
		EncodingType?: string;
	}

	export interface BucketObject {
		Key: string;
		LastModified: string;
		ETag: string;
		Size: string;
		Owner: {
			ID: string;
			DisplayName: string;
		};
		StorageClass: string;
	}

	export interface BucketContentsResult extends COSResult {
		Name: string;
		Prefix: string;
		Marker: string;
		MaxKeys: string;
		Delimiter: string;
		IsTruncated: string;
		NextMarker: string;
		EncodingType: string;
		CommonPrefixes: {
			Prefix: string;
		}[];
		Contents: BucketObject[];
	}

	export interface UploadBucketObjectOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		Body: Stream | Buffer | string;
		CacheControl?: string;
		ContentDisposition?: string;
		ContentEncoding?: string;
		ContentLength?: number;
		ContentType?: string;
		Expires?: string;
		Expect?: string;
		ACL?: BucketObjectACL;
		GrantRead?: string;
		GrantReadAcp?: string;
		GrantWriteAcp?: string;
		GrantFullControl?: string;
		StorageClass?: string;
		// TODO: 允许用户自定义的头部信息，将作为对象的元数据保存，大小限制2KB
		// x-cos-meta-*
		onTaskReady?: (taskId: string) => void;
		onProgress?: (progressData: {
			loaded: number;
			total: number;
			speed: number;
			percent: number;
		}) => void;
	}

	export interface UploadBucketObjectResult extends COSResult {
		ETag: string;
		Location: string;
		VersionId: string;
	}

	export interface DownloadObjectOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		Output: string | WriteStream;
		ResponseContentType?: string;
		ResponseContentLanguage?: string;
		ResponseExpires?: string;
		ResponseCacheControl?: string;
		ResponseContentDisposition?: string;
		ResponseContentEncoding?: string;
		Range?: string;
		IfModifiedSince?: string;
		IfUnmodifiedSince?: string;
		IfMatch?: string;
		IfNoneMatch?: string;
		VersionId?: string;
		onProgress?: (progressData: {
			loaded: number;
			total: number;
			speed: number;
			percent: number;
		}) => void;
	}

	export interface DownloadObjectResult extends COSResult {
		CacheControl: string;
		ContentDisposition: string;
		ContentEncoding: string;
		Expires: string;
		// TODO: 用户自定义的元数据
		// x-cos-meta-*
		'x-cos-storage-class': string;
		NotModified: boolean;
		ETag: string;
		VersionId: string;
		Body: Buffer;
	}

	export interface CopyObjectOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		CopySource: string;
		ACL?: BucketObjectACL;
		GrantRead?: string;
		GrantWrite?: string;
		GrantFullControl?: string;
		MetadataDirective?: string;
		CopySourceIfModifiedSince?: string;
		CopySourceIfUnmodifiedSince?: string;
		CopySourceIfMatch?: string;
		CopySourceIfNoneMatch?: string;
		// TODO: 其他自定义的文件头部
		// x-cos-meta-*
	}

	export interface CopyObjectResult extends COSResult {
		ETag: string;
		LastModified: string;
		VersionId: string;
	}

	export interface ObjectCrossDomainOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		Origin: string;
		AccessControlRequestMethod: string;
		AccessControlRequestHeaders?: string;
	}

	export interface ObjectCrossDomainResult extends COSResult {
		AccessControlAllowOrigin: string;
		AccessControlAllowMethods: string;
		AccessControlAllowHeaders: string;
		AccessControlExposeHeaders: string;
		AccessControlMaxAge: string;
		OptionsForbidden: boolean;
	}

	export interface DeleteObjectOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		VersionId?: string;
	}

	export interface DeleteMultipleObjectOptions {
		Bucket: string;
		Region: BucketRegion;
		Objects: {
			Key: string;
		}[];
		Quiet?: boolean;
		VersionId?: string;
	}

	export interface DeleteMultipleObjectResult extends COSResult {
		Deleted: {
			Key: string;
			VersionId: string;
			DeleteMarker: string;
			DeleteMarkerVersionId: string;
		}[];
		Error: {
			Key: string;
			Code: string;
			Message: string;
		}[];
	}

	export interface SliceUploadFileOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		FilePath: string;
		SliceSize?: string;
		AsyncLimit?: string;
		StorageClass?: string;
		onTaskReady?: (taskId: string) => void;
		onHashProgress?: (progressData: {
			loaded: number;
			total: number;
			speed: number;
			percent: number;
		}) => void;
		onProgress?: (progressData: {
			loaded: number;
			total: number;
			speed: number;
			percent: number;
		}) => void;
	}

	export interface SliceUploadFileResult extends COSResult {
		Location: string;
		Bucket: string;
		Key: string;
		ETag: string;
		VersionId: string;
	}

	export interface SliceCopyFileOptions {
		Bucket: string;
		Region: BucketRegion;
		Key: string;
		CopySource: string;
		ChunkSize: number;
		SliceSize: number;
		onProgress?: (progressData: {
			loaded: number;
			total: number;
			speed: number;
			percent: number;
		}) => void;
	}

	export interface SliceCopyFileResult extends COSResult {
		Location: string;
		Bucket: string;
		Key: string;
		ETag: string;
		VersionId: string;
	}

	export interface MultiFileUploadOptions {
		files: {
			Bucket: string;
			Region: BucketRegion;
			Key: string;
			FilePath: string;
		}[];
		SliceSize: number;
		onProgress?: (progressData: {
			loaded: number;
			total: number;
			speed: number;
			percent: number;
		}) => void;
		onFileFinish?: (err: object | null, data: object, options: object) => void;
	}

	export interface MultiFileUploadResult extends COSResult {
		files: {
			error: object | null;
			data: object;
			options: object;
		}[];
	}

	declare class COS {
		constructor(options: COSOptions);
		// 列出存储桶列表
		public getService(cb: (err: COSError | null, data: BucketListResult) => void): void;
		// 列出指定地域的存储桶列表。
		public getService(
			options: BucketListOptions,
			cb: (err: COSError | null, data: BucketListResult) => void,
		): void;
		// PUT Bucket 接口请求可以在指定账号下创建一个存储桶。
		public putBucket(
			options: CreateBucketOptions,
			cb: (err: COSError | null, data: CreateBucketResult) => void,
		): void;
		// 检索存储桶及其权限
		public headBucket(
			options: BucketOptions,
			cb: (err: COSError | null, data: COSResult) => void,
		): void;
		// 删除存储桶
		public deleteBucket(
			options: BucketOptions,
			cb: (err: COSError | null, data: COSResult) => void,
		): void;
		// 设置存储桶 ACL
		public putBucketAcl(
			options: BucketACLOptions,
			cb: (err: COSError | null, data: COSResult) => void,
		): void;
		// 查询存储桶 ACL
		public getBucketAcl(
			options: BucketOptions,
			cb: (err: COSError | null, data: BucketACLDetailResult) => void,
		): void;
		// 查询对象列表
		public getBucket(
			options: BucketContentsOptions,
			cb: (err: COSError | null, data: BucketContentsResult) => void,
		): void;
		// 简单上传对象
		public putObject(
			options: UploadBucketObjectOptions,
			cb: (err: COSError | null, data: UploadBucketObjectResult) => void,
		): void;
		// 下载对象
		public getObject(
			options: DownloadObjectOptions,
			cb: (err: COSError | null, data: DownloadObjectResult) => void,
		): void;
		// 复制对象
		public putObjectCopy(
			options: CopyObjectOptions,
			cb: (err: COSError | null, data: CopyObjectResult) => void,
		): void;
		// 预请求跨域配置
		public optionsObject(
			options: ObjectCrossDomainOptions,
			cb: (err: COSError | null, data: ObjectCrossDomainResult) => void,
		): void;
		// 删除单个对象
		public deleteObject(
			options: DeleteObjectOptions,
			cb: (err: COSError | null, data: COSResult) => void,
		): void;
		// 删除多个对象
		public deleteMultipleObject(
			options: DeleteMultipleObjectOptions,
			cb: (err: COSError | null, data: DeleteMultipleObjectResult) => void,
		): void;
		// 分块上传对象
		public sliceUploadFile(
			options: SliceUploadFileOptions,
			cb: (err: COSError | null, data: SliceUploadFileResult) => void,
		): void;
		// 复制对象 用于大文件
		public sliceCopyFile(
			options: SliceCopyFileOptions,
			cb: (err: COSError | null, data: SliceCopyFileResult) => void,
		): void;
		// 批量上传
		public uploadFiles(
			options: MultiFileUploadOptions,
			cb: (err: COSError | null, data: MultiFileUploadResult) => void,
		): void;
		// 获取任务列表
		public getTaskList(): any;
		// 取消上传任务
		public cancelTask(taskId: string): void;
		// 暂停上传任务
		public pauseTask(taskId: string): void;
		// 重启上传任务
		public restartTask(taskId: string): void;
		// 监听事件
		// eslint-disable-next-line @typescript-eslint/ban-types
		public on(eventName: string, cb: Function): void;
	}

	export = COS;
}
