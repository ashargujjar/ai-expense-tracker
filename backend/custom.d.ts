import { JwtPayload } from 'jsonwebtoken';

declare global {
  interface CustomJwtPayload extends JwtPayload {
    id: string;
  }

  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

