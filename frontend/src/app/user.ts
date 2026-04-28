// Interface for aws user registration
export interface IUser {
  username: string;
  password: string;
  options: {
    userAttributes: {
      email: string;
    };
  };
}
