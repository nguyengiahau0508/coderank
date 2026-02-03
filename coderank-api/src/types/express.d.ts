declare global {
  namespace Express {
    interface User {
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}

export {};
