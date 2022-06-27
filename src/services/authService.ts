import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { HttpException } from '../exceptions/HttpException';
import { Credentials, User } from '../types';
import userModel from '../models/User';

export type TokenData = {
  token: string;
  maxAge: number;
  expirationDate: string;
};

export type DataStoredInToken = {
  _id: string;
};

const register = async ({ email, password }: Credentials): Promise<void> => {
  if (!email || !password) {
    throw new HttpException(400, 'Required email and password');
  }

  const user: User | null = await userModel.findOne({ email });

  if (user) {
    throw new HttpException(409, `Email ${email} already exists`);
  }

  const hashedPassword = await hash(password, 10);

  await userModel.create({
    email,
    password: hashedPassword,
    favoriteCharacters: [],
  });
};

const login = async ({
  email,
  password,
}: Credentials): Promise<{
  cookie: string;
  user: User;
  expirationDate: string;
}> => {
  if (!email || !password) {
    throw new HttpException(400, 'Incomplete credentials');
  }

  const user: User | null = await userModel.findOne({ email });
  if (!user) {
    throw new HttpException(409, 'Wrong email or password');
  }

  const isPasswordMatching: boolean = await compare(password, user.password);
  if (!isPasswordMatching) {
    throw new HttpException(409, 'Wrong email or password');
  }

  const tokenData = createToken(user);
  const cookie = createCookie(tokenData);

  return { cookie, user, expirationDate: tokenData.expirationDate };
};

const createToken = ({ _id }: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { _id };
  const secretKey = process.env.TOKEN_SECRET;

  if (!secretKey) {
    throw new HttpException(500, `Missing environment config`);
  }

  const maxAge = 15 * 60 * 1000;
  const expirationDate = new Date(new Date().getTime() + maxAge).toISOString();

  return {
    expirationDate,
    maxAge,
    token: sign(dataStoredInToken, secretKey, { expiresIn: maxAge }),
  };
};

const createCookie = ({ token, maxAge }: TokenData): string => {
  return `token=${token}; HttpOnly; Max-Age=${maxAge};`;
};

export { register, login };
