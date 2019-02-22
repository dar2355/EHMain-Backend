import * as Router from 'koa-router';

import * as User from '../controllers/users';
import * as jwt from '../middlewares/jwt';


const router = new Router();

router
  .use(jwt.errorHandler())
  .use(jwt.jwt());

router
  .post('/api/users/linkMember', User.linkMember)
  .get('/api/users', User.getUsers)
  .post('/api/users', User.addUser)
  .delete('/api/users', User.deleteUser)

export default router;