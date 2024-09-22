import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}

  @Post('create')
  async createUser(@Body() body: CreateUserDto): Promise<User> {
    return await this.usersService.create(body);
  }

  @Post('ebook')
  async sendEbook(
    @Body() body: { firstName: string; lastName: string; email: string },
  ): Promise<string> {
    return await this.usersService.sendEbook(body);
  }
}
