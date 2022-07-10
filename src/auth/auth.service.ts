import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from "argon2";
import { AuthDto } from "./dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}
    async login(dto: AuthDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new ForbiddenException("Invalid credentials");
        }

        const isValid = await argon.verify(user.hash, dto.password);
        if (!isValid) {
            throw new ForbiddenException("Invalid credentials");
        }

        return user;
    }
    async signup(dto: AuthDto) {
        // generate password hash
        const hash = await argon.hash(dto.password);
        // save new user to db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            });
            return user;
        }
        catch (err) {
            if (err.code === 'P2002') {
                throw new ForbiddenException('Credentials are taken');
            }
        }
    }
}