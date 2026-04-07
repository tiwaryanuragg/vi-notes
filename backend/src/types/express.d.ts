import { JwtUserPayload } from "./auth";

declare global {
  namespace Express {
    interface Request {
      authUser?: JwtUserPayload;
    }
  }
}

export {};
