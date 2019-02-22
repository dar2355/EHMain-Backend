import * as Router from 'koa-router';
import auth from '../middlewares/auth';

const router = new Router();

router
  .post('/api/login', async (ctx) => {
    console.log('attempt');
    await auth(ctx);
  })
  .get('/api/logout', async (ctx) => {

  })

export default router;