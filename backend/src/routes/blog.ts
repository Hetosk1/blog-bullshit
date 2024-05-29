import { Hono } from "hono";
import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { Variables } from "hono/types";

export const blogRouter = new Hono<{
    Variables: Variables,
    Bindings:{
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();



blogRouter.post('/create', async(c) => {
    try{
        console.log("welcome the to route");
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const userId = c.get('userId') as string;
        console.log(`the userid in blog route is ${userId}`)
        
        const post = await prisma.post.create({
            data:{
                title: body.title || "",
                content: body.content || "",
                authorId: userId, 
                published: false
            }
        });

        console.log(post);

        return c.json({
            Message: "entry successfull"
        });
    } catch(e){
        return c.json({
            error: {e}
        });
    }
});

blogRouter.put('/update', async(c) => {
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const userId = c.get('userId');
        const payload = await c.req.json();

        await prisma.post.update({
            where: {
                id: payload.postId,
                authorId: payload.userId
            },
            data: {
                title: payload.title,
                content: payload.content
            }
        });

        return c.json({
            Message: "Updation Successfull"
        });
    } catch(e){ 
        return c.json({
            error: {e}
        })
    }
});

blogRouter.get('/bulk', async(c) => {
    try{

        console.log('benchod')
        const primsa = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const posts = await primsa.post.findMany();

        return c.json({
            posts
        });
    } catch(e) {
        return c.json({e});
    }
});

blogRouter.get('/:id', async(c) => {
    try{
        const primsa = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const id = c.req.param('id');

        const post = await primsa.post.findUnique({
            where: {
                id: id
            }
        });

        return c.json({
            post
        });
    } catch(e){
        return c.json({
            Error: {e}
        });
    }

});



export default blogRouter;

