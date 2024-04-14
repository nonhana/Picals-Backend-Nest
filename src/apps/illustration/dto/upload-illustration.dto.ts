import {
  IsNotEmpty,
  Length,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
} from 'class-validator';

export class UploadIllustrationDto {
  @IsNotEmpty({
    message: '作品名称不能为空',
  })
  @Length(1, 63, {
    message: '作品名称长度不能大于63',
  })
  name: string;

  @IsNotEmpty({
    message: '作品简介不能为空',
  })
  @Length(1, 2047, {
    message: '作品简介长度不能大于2047',
  })
  intro: string;

  @IsNotEmpty({
    message: '作品标签不能为空',
  })
  @ArrayMinSize(1, {
    message: '至少需要一个标签',
  })
  @ArrayMaxSize(20, {
    message: '标签数量不能超过20个',
  })
  labels: string[];

  @IsNotEmpty({
    message: '是否转载不能为空',
  })
  isReprinted: boolean;

  @IsNotEmpty({
    message: '是否开启评论不能为空',
  })
  openComment: boolean;

  @IsNotEmpty({
    message: '是否AI生成不能为空',
  })
  isAIGenerated: boolean;

  @IsNotEmpty({
    message: '作品列表不能为空',
  })
  @ArrayMinSize(1, {
    message: '至少需要一个图片',
  })
  @ArrayMaxSize(100, {
    message: '图片数量不能超过100张',
  })
  imgList: string[];

  @IsOptional()
  @Matches(/(https?:\/\/.*\.(?:png|jpg))/, {
    message: '图片格式不正确，需要以http或https开头、以png或jpg结尾',
  })
  workUrl?: string;

  @IsOptional()
  illustratorInfo?: {
    name: string;
    homeUrl: string;
  };
}
