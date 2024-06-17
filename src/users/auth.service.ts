import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signup(email: string, password: string) {
        // see if email is in use
        const users = await this.usersService.find(email);
        // hash the user's password

        // create a new user and save it

        // return the user
    }

    signin() {

    }
}