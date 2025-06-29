import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  findAll() {
    return { message: 'Get all users' };
  }

  findOne(id: string) {
    return { message: `Get user with id: ${id}` };
  }

  create(createUserDto: any) {
    return { message: 'Create user', data: createUserDto };
  }

  update(id: string, updateUserDto: any) {
    return { message: `Update user with id: ${id}`, data: updateUserDto };
  }

  remove(id: string) {
    return { message: `Delete user with id: ${id}` };
  }
}
