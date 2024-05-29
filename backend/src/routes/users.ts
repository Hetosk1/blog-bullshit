import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt';
import {} from "zod-hetoski"


export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>();


userRouter.post("/signup", async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try{
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password
      }
    });

    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET) 

    return c.text("jwt here");
  }
  catch(e){
    return c.status(403);
  }
});

userRouter.post("/signin", async (c) => {
	const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    }
  });

  if(!user){
    c.status(401);
    return c.json({
      message: "Invalid credentials"
    });
  } else {
    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET);

    return c.json({jwt});
  }
});

export default userRouter;
