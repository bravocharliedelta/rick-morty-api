export type Credentials = {
  email?: string;
  password?: string;
};

export type User = {
  _id: string;
  email: string;
  password: string;
  favoriteCharacters: string[];
};
