import * as jwt from './jwt'
import * as Koa from 'koa';
import User from '../models/userModel';
import * as bcrypt from 'bcrypt';
import { IUserSchema } from '../models/userModel';

export default async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const {username, password} = ctx.request.query;

  const user = await User.findOne({username: username}).populate('member') as any as IUserSchema;
  let error: string;
  if (user) {
    if(await bcrypt.compare(password, user.password)) {
      const roles = (user.member && typeof user.member !== 'string') ? user.member.titles : [];

      ctx.status = 200;
      ctx.body = {
        token: jwt.issue({
          user: user._id,
          roles: roles,
          issuedOn: Date.now(),
          expiresAt: Date.now() + 21600000 // number of milliseconds in 6 hours
        })
      }
      return;
    }
    else {
      error = 'incorrect password';
    }
  }
  else {
    error = 'user does not exist';
  }

  // if it's down here then something went wrong
  ctx.status = 401;
  ctx.body = {error};
  return;
}