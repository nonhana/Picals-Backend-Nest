import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { UploadIllustrationDto } from './dto/upload-illustration.dto';
import { RequireLogin, UserInfo } from 'src/decorators/login.decorator';
import { JwtUserData } from 'src/guards/auth.guard';

@Controller('illustration')
export class IllustrationController {
  @Inject(IllustrationService)
  private readonly illustrationService: IllustrationService;

  @Post('upload')
  @RequireLogin()
  async upload(
    @UserInfo() userInfo: JwtUserData,
    @Body() uploadIllustrationDto: UploadIllustrationDto,
  ) {
    const { id } = userInfo;
    return await this.illustrationService.createItem(id, uploadIllustrationDto);
  }
}
