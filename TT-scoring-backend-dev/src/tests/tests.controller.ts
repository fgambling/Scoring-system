import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-role.enum';
import { TestsService } from './tests.service';
import { TestDto } from 'src/dto/test.dto';
import { KeysDto } from 'src/dto/keys.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignMarkerDto } from 'src/dto/assign.marker.dto';

@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Post('save')
  saveTest(@Req() request: Request, @Body() testDto: TestDto) {
    return this.testsService.saveTest(request, testDto);
  }

  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Get('/:id?')
  getTests(@Req() request: Request, @Param('id') id: string) {
    if (id) {
      return this.testsService.getTestById(request, id);
    } else {
      return this.testsService.getTests(request);
    }
  }

  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Delete('delete/:id')
  deleteTest(@Req() request: Request, @Param('id') id: string) {
    return this.testsService.deleteTestById(request, id);
  }

  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Post('/duplicate')
  duplicateTest(@Req() request: Request, @Body('id') id: string) {
    return this.testsService.duplicateTestById(request, id);
  }

  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Post('/generateKeys')
  async generateAlternativeKeys(@Body() keysDto: KeysDto) {
    return await this.testsService.generateAlternativeKeys(keysDto);
  }

  @Roles(UserRole.TestDeveloper)
  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importTest(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    return this.testsService.importTest(file, name);
  }
  @Roles(UserRole.TestDeveloper)
  @HttpCode(HttpStatus.OK)
  @Post('/assign')
  assignMarker(
    @Req() request: Request,
    @Body() assignMakerDto: AssignMarkerDto,
  ) {
    return this.testsService.assignMarker(request, assignMakerDto);
  }
}
