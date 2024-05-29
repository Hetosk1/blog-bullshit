import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt';
import {userRouter} from './routes/users';
import { blogRouter } from './routes/blog';
import { Variables } from 'hono/types';

const app = new Hono<{
  Variables: Variables
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>();



app.use('/api/v1/blogs/*', async (c, next) => {
  const jwt = c.req.header('Authorization');
  if(!jwt){
    c.status(401);
    return c.json({
      "Message": "Unauthorized, Token not found"
    });
  }

  console.log("Token found, looking for validation...");

  const token = jwt.split(' ')[1];
  const payload = await verify(token, c.env.JWT_SECRET);

  if(!payload){
    return c.json({
      "Message": "Unauthorized"
    });
  }

  c.set('userId', payload.id);
  console.log(`Authorization process completed, you are allowed to proceed and user id is ${payload.id}`);

  await next();
});

app.get('/', (c) => {
  return c.text('Welcome the the Blog API!');
})

app.route('/api/v1/users', userRouter);
app.route('/api/v1/blogs', blogRouter);






export default app
