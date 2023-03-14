import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/users.entity';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    async fetchUsers(): Promise<User[]> {
        const users = await this.usersRepo.find();
        if (!users || !users.length) {
            return []
        }
        return users;
    }

}
