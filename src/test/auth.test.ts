import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../server';
import userModel from '../models/User';

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: { once: jest.fn() },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'supersecure'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2020, 6, 26, 14, 0));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Auth:', () => {
  describe('[POST] /register', () => {
    it('registers a user', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'strongPassword',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue({
        _id: 'userId',
        email: credentials.email,
        password: await bcrypt.hash(credentials.password, 10),
      });

      //

      return request(app)
        .post('/register')
        .expect('Content-Type', /json/)
        .send({ ...credentials })
        .expect(201)
        .expect((res) => expect(res.body.message).toBe('registered'));
    });

    it('fails to register without email', async () => {
      const credentials = {
        password: 'strongPassword',
      };

      return request(app)
        .post('/register')
        .expect('Content-Type', /json/)
        .send({ ...credentials })
        .expect(400)
        .expect((res) =>
          expect(res.body.message).toBe('Required email and password')
        );
    });

    it('fails to register without password', async () => {
      const credentials = {
        email: 'test@test.com',
      };

      return request(app)
        .post('/register')
        .expect('Content-Type', /json/)
        .send({ ...credentials })
        .expect(400)
        .expect((res) => (res.body.message = 'Required email and password'));
    });

    it('does not register already taken email', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'strongPassword',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'userId',
        email: credentials.email,
        password: await bcrypt.hash(credentials.password, 10),
      });

      return request(app)
        .post('/register')
        .expect('Content-Type', /json/)
        .send({ ...credentials })
        .expect(409)
        .expect((res) =>
          expect(res.body.message).toBe('Email test@test.com already exists')
        );
    });
  });

  describe('[POST] /login', () => {
    it('login a user successfully', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'strongPassword',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'userId',
        email: credentials.email,
        password: await bcrypt.hash(credentials.password, 10),
      });

      return request(app)
        .post('/login')
        .expect('Content-Type', /json/)
        .send({ ...credentials })
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('set-cookie', [
            'Authorization=supersecure; HttpOnly; Max-Age=900000;',
          ]);
          expect(res.body.userId).toBe('userId');

          expect(res.body.expirationDate).toBe('2020-07-26T12:15:00.000Z');
        });
    });
  });
});
