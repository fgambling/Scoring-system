import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.enum';
import { AutoMarkService } from './auto-mark.service';
import { Response as JsonResponse } from 'src/common/json.response.interface';
import { Response } from 'express';

@Controller('auto-mark')
export class AutoMarkController {
  constructor(private autoMarkService: AutoMarkService) {}
  @Roles(UserRole.TestDeveloper)
  @Post('/start')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async autoMark(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('_id') id: string,
  ): Promise<JsonResponse<any>> {
    return await this.autoMarkService.autoMark(request, file, id);
  }
  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Get('/report/:id?')
  async getTests(@Req() request: Request, @Param('id') id: string) {
    return await this.autoMarkService.getMarkingReport(request, id);
  }
  @Roles(UserRole.TestDeveloper, UserRole.Marker)
  @HttpCode(HttpStatus.OK)
  @Get('/download/:id?')
  async download(
    @Req() request: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.autoMarkService.download(request, id);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="scores.xlsx"',
      );
      res.end(buffer);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Get('/markers')
  async getMarkerList() {
    return await this.autoMarkService.getMarkerList();
  }
}
