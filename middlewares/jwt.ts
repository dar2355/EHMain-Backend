import * as koaJwt from 'koa-jwt';
import { randomBytes } from 'crypto';
import * as jsonwebtoken from 'jsonwebtoken';
import * as Koa from 'koa';
import { role } from '../models/memberModel';

// securely randomizes the key
// NOTE - this should NOT be done in a production environment
//      it is done this way because people could get this source
//      code fairly easily if they wanted to - so the encryption
//      key will be reset upon each server launch.
process.env.signature = randomBytes(20).toString('hex');

const jwtInstance = koaJwt({
  secret: process.env.signature,
})

const JWTErrorHandler = (ctx: Koa.ParameterizedContext<any, {}>, next: any) => {
  return next().catch((err: any) => {
    console.log(err);
      if (401 == err.status) {
          ctx.status = 401;
          ctx.body = {
              "error": "Not authorized"
          };
      } else {
          throw err;
      }
  });
};

export const jwt = () => jwtInstance;
export const errorHandler = () => JWTErrorHandler;

export const issue = (payload: any) => {
  return jsonwebtoken.sign(payload, process.env.signature, {
    expiresIn: '24h' // makes the token expire in 24 hours
  });
}

export const checkRole = async (ctx: Koa.ParameterizedContext<any, {}>, next: any, rolesNeeded: role[]) => {
  const roles: role[] = (await jsonwebtoken.decode(ctx.req.headers.authorization.substring(7)) as any)['roles'];
  if (rolesNeeded.length === 0 || roles.some(role => rolesNeeded.includes(role))) {
    return await next();
  } else {
    ctx.redirect('back');
    ctx.body = {
      error: "required role not present"
    };
    return;
  }
}