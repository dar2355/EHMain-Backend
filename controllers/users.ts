import * as Koa from 'koa';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import User, { IUserSchema } from '../models/userModel';
import Member, { IMemberSchema } from '../models/memberModel';

const saltRounds = 10;

export const getUsers = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const users = await User.find({});

  if (!users || users.length === 0) {
    ctx.body = 'Users not Found';
  } else {
    ctx.body = users;
  }
}

export const linkMember = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const {username, firstName, lastName} = ctx.request.query;

  const user = (await User.findOne({username})) as any as IUserSchema;
  const member = await Member.findOne({firstName, lastName}) as any as IMemberSchema;

  if (!user) return ctx.body = 'user not found!';
  else if (!member) return ctx.body = 'member not found!';

  user.member = member._id;

  await User.updateOne({username}, user);
  ctx.body = {user, member};
}

export const addUser = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const { username, email, password } = ctx.request.query;

  if ((await User.find({username})).length) {
    ctx.body = 'username taken!';
    return;
  }

  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  let newUser = await User.create({_id: new mongoose.Types.ObjectId(), username, email: {address: email}, password: hash});
  ctx.body = newUser;
}

export const deleteUser = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  await User.deleteOne(ctx.request.query);
  ctx.body = "user deleted successfully"
}