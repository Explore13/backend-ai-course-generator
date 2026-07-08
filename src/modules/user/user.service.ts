import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }
  // user create
  async createUser(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  // user update
  async updateUser(clerk_id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.getUser(clerk_id)
    if (updateUserDto?.clerk_id && updateUserDto.clerk_id !== clerk_id) {
      throw new BadRequestException("You cannot update clerk_id");
    }
    if (existingUser.role !== Role.Admin && updateUserDto?.role && updateUserDto.role !== existingUser.role) {
      throw new BadRequestException("You cannot update role");
    }

    const updatedUser = await this.userRepository.save({ ...existingUser, ...updateUserDto });
    return updatedUser;
  }

  // get user
  async getUser(clerk_id: string) {
    const user = await this.userRepository.findOneBy({ clerk_id });
    if (!user) {
      throw new BadRequestException("user not found");
    }
    return user;
  }

  // delete user
  async deleteUser(clerk_id: string) {
    const existingUser = await this.getUser(clerk_id)

    await this.userRepository.softRemove(existingUser);
    return {
      message: `user with clerk_id ${existingUser.clerk_id} is deleted successfully`,
    };
  }
}
