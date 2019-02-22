import * as Koa from 'koa';
import * as mongoose from 'mongoose';

import Member from '../models/memberModel';

// used by authenticated members of ehouse
export const getMembers = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const members = await Member.find({});

  if (!members) {
    ctx.body = 'Members not Found';
  } else {
    ctx.body = members;
  }
}

// used when the visitor is not authenticated
export const getMembersPublic = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const currentYear = new Date().getFullYear();
  const members = await Member.find({
    joinDate: `/${currentYear}|${currentYear + 1}/i`
  }, 'firstName onFloor titles joinDate')
  ctx.body = members;
}

export const addMember = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  let newUser = await Member.create({_id: new mongoose.Types.ObjectId(), ...ctx.request.query});
  ctx.body = newUser;
}

export const deleteMember = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  await Member.remove(ctx.request.query);
  ctx.body = "user deleted successfully"
}

export const updateMember = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  await Member.update
  ctx.body = "user deleted successfully"
}