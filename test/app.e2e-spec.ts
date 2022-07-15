import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const ModuleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = ModuleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(2345);
    pactum.request.setBaseUrl('http://localhost:2345');

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'ramatest@test.com',
      password: 'test',
    };

    describe('Signup', () => {
      it('throws an error if email is not provided', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('throws an error if password is not provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'test@test.com',
          })
          .expectStatus(400);
      });

      it('should signup a new user', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Login', () => {
      it('should login a user', async () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('GetMe', () => {
      it('should get me', async () => {
        return pactum.spec().get('/users/me').expectStatus(200).withHeaders({
          Authorization: 'Bearer $S{token}',
        });
      });
    });
    describe('Edit User', () => {
      it('should update user', async () => {
        const dto: EditUserDto = {
          email: 'raaheebwa@gmail.com',
          firstName: 'RamadhanA',
          lastName: 'AheebwaA',
        };

        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Create', () => {
      it.todo('should create a bookmark');
    });
    describe('List', () => {
      it.todo('should list bookmarks');
    });
    describe('Delete', () => {
      it.todo('should delete a bookmark');
    });
  });
});
