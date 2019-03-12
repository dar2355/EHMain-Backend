import * as Router from 'koa-router';

import * as Members from '../controllers/members';
import * as jwt from '../middlewares/jwt';

const router = new Router();

// router
//   .use(jwt.errorHandler())
//   .use(jwt.jwt());

router
  .get('/api/members/full', /*(ctx, next) => jwt.checkRole(ctx, next, ['computer chairman']),*/ Members.getMembers)
  .get('/api/members/simple', /*(ctx, next) => jwt.checkRole(ctx, next, ['computer chairman']),*/ Members.getMemberNames)
  .post('/api/members', Members.addMember)
  .delete('/api/members', Members.deleteMember)
  .put('/api/members', Members.updateMembers);

export default router;