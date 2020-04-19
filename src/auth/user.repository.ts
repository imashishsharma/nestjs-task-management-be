import { User } from './user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    const { username, password } = authCredentialsDTO;
    const salt = await bcrypt.genSalt();
    const user = new User();
    user.username = username;
    user.password = await this.hashPassword(password, salt);
    user.salt = salt;
    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUserPassword(authCredentialsDTO: AuthCredentialsDTO): Promise<string> {
    const {username, password} = authCredentialsDTO;
    const user: User = await this.findOne({username});
    if (user && await user.validatePassword(password)) {
        return user.username;
    }
    return null;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
      return bcrypt.hash(password, salt);
  }
}
