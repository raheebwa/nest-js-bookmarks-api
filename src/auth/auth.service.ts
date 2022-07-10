import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}
    login() {
        return {msg: 'I ahve logged in'};
    }
    signup() {
        return {msg: 'I have signed up'};
    }
}