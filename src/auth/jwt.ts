import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const JwtPayload = { sub: string; role: string};

export const signAccessToken = (payload: JwtPayLoad, expiresIn = "1h") =>
    jwt.sign(payload, env.jwtSecret, { experesIn });

export const verifyAcessToken = (token: string) =>
    jwt.verify(token, env.jwtSecret) as JwtPayload;