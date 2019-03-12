import * as Koa from 'koa';
import * as mongoose from 'mongoose';

import { Member, order } from '../models/memberModel';
import { getBaseSchema, getFullStructure } from './_helpers';

// used by authenticated members of ehouse
export const getMembers = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const members = await Member.find({});

  if (!members) {
    ctx.body = {
      error: 'Members not Found'
    };
  } else {
    ctx.body = {
      base: getBaseSchema(Member),
      called: Member.schema.obj,
      structure: getFullStructure(order, Member),
      members
    };
  }
}

export const getMemberNames = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  const members = await Member.find({}, '_id firstName lastName')

  if (!members) {
    ctx.body = {
      error: 'Members not Found'
    };
  } else {
    ctx.body = {
      members
    }
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
  console.log(ctx.request.body);
  for (const doc of ctx.request.body) {
    if (!doc._id) continue;
    else await Member.deleteOne({_id: doc._id});
  }
  ctx.body = {
    message: "member deleted successfully"
  }
}

export const updateMembers = async (ctx: Koa.ParameterizedContext<any, {}>) => {
  console.log(ctx.request.body);
  for (const doc of ctx.request.body) {
    if (!doc._id) await Member.create({_id: new mongoose.Types.ObjectId(), ...doc});
    else await Member.updateOne({_id: doc._id}, doc, {runValidators: true});
  }
  ctx.body = {
    message: "members updated successfully"
  }
}