import * as combineRouters from 'koa-combine-routers';

import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import memberRoutes from './memberRoutes';
import backupRoutes from './backupRoutes';

const insecure = combineRouters(
  authRoutes,
  userRoutes
);

const secure = combineRouters(

  memberRoutes,
  backupRoutes
);

export const secureRouter = secure;
export const insecureRouter = insecure;