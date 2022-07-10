import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
    login() {
        return {msg: 'I ahve logged in'};
    }
    signup() {
        return {msg: 'I have signed up'};
    }
}