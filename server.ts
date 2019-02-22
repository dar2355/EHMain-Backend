import * as Koa from 'koa';
import * as session from 'koa-session';
import * as bodyparser from 'koa-bodyparser';
import * as cors from '@koa/cors';

// import * as Events from './controllers/events';
import * as Backups from './backups/controller';

import { secureRouter, insecureRouter } from './routes/index';
import * as mongoose from 'mongoose';

import * as jwt from './middlewares/jwt';

const app = new Koa();

// sessions
app.keys = ['zup3r-sekret-k3y'];
app.use(session(app));

// body parser
app.use(bodyparser())

// CORS enabler
app.use(async (ctx, next) => {
  // console.log('------ req:')
  // console.log(ctx.request);
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Headers', 'Origin Content-Type, X-Auth-Token, authorization');
  ctx.set('Access-Control-Allow-Credentials', 'true');
  await next();
  // console.log('------ res:')
  // ctx.status = 200;
  // console.log(ctx.response)

});

console.log(app);

// initiates the timeout that monitors the backups every hour
// also connects to the main database, sets the use of routers,
// and listens on port 3000
const main = async () => {
  await mongoose.connect('mongodb://localhost:27017/EHMain', { useNewUrlParser: true });

  setInterval(() => {
    Backups.mainLoop();
  }, 3600000); // 1 hour
  Backups.mainLoop();

  app.use(insecureRouter());

  app
    .use(jwt.errorHandler())
    .use(jwt.jwt().unless({ method: 'OPTIONS' }))

  app.use(secureRouter());

  app.listen(3000);
}

main();