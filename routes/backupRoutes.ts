import * as Router from 'koa-router';
import * as jwt from '../middlewares/jwt';

import * as Backups from '../backups/controller';

const router = new Router();

router
  .use(jwt.errorHandler())
  .use(jwt.jwt());

router
  .post('/api/backups', Backups.backup)
  .post('/api/backups/snapshots', Backups.snapshot)
  .post('/api/backups/restore', Backups.restore)
  .get('/api/backups', Backups.getBackedUp)
  .get('/api/backups/snapshots', Backups.getSnapshots)

export default router;