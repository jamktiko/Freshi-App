export interface IUser {
  username: string;
  password: string;
  options: {
    userAttributes: {
      email: string;
    };
  };
}
