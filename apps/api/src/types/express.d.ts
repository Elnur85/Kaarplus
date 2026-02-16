import { UserRole } from "@kaarplus/database";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        name?: string | null;
      };
      rawBody?: Buffer;
    }
  }
}

export { };
