import { events, subscriptionEvents } from "../../common/constants";
import { v4 as uuid } from "uuid";

/*
query GET_POST($id: ID!) {
  getPost(id: $id) {
    id
    title
    createdAt
    user {
      name
    }
  }
}

{
  "id": "620146c3-98ab-485b-8729-2a99a1d11017"
}
*/
export const getPost = async (parent, arg, { db, pubsub }, info) => {
  let { id } = { ...arg };
  const post = db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      published: true,
      createdAt: true,
      user: true,
    },
  });
  if (!post) throw new Error("Post not found");
  return post;
};

export const getPostsSearchByTitle = async (parent, arg, { db, pubsub }) => {
  let query = "";
  if (arg.query) query = arg.query.toLowerCase();

  const posts = await db.post.findMany({
    where: {
      title: {
        search: query,
      },
    },

    select: {
      id: true,
      title: true,
      description: true,
      published: true,
      createdAt: true,
      user: true,
    },
  });

  return posts;
};
export const createPost = async (parent, arg, { db, pubsub }, info) => {
  const {
    post: { title, description, published, userId },
  } = { ...arg };

  const userExisted = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userExisted) {
    throw new Error("User not existed!");
  }

  const newPost = {
    id: uuid(),
    title,
    description,
    published,
  };

  const createPost = await db.post.create({
    data: {
      ...newPost,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      published: true,
      user: true,
    },
  });
  console.log("createPost: ", createPost);

  // if the post published: true
  // then we fire post event for the new post
  if (published) {
    // the data name should be matched with the name in the subscription resolver and schema (post)
    pubsub.publish(subscriptionEvents.POST, {
      post: {
        event: events.CREATE,
        data: createPost,
      },
    });
  }

  return createPost;
};
export const deletePost = async (parent, arg, { db, pubsub }, info) => {
  const { id } = { ...arg };

  const post = await db.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found!");

  const deletePost = await db.post.delete({
    where: { id },
  });

  if (deletePost.published) {
    /**
     * @param eventName
     * @param (object)
     * {
     *     subscription_type: {
     *      event,
     *      data
     *     }
     * }
     */
    pubsub.publish(subscriptionEvents.DELETE_POST, {
      deletePost: {
        event: events.DELETE,
        data: deletePost,
      },
    });
  }

  return deletePost;
};
export const updatePost = async (parent, arg, { db, pubsub }, info) => {
  const { id, data } = { ...arg };

  const post = await db.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found!");

  const updatedPost = await db.post.update({
    where: { id },
    data: { ...data },
  });

  /**
   * pubsub.publish()
   * first arg: event name
   * second arg: payload
   * { subscriptionType: {event (whatever you like), data} }
   */
  if (updatedPost.published && !post.published) {
    pubsub.publish(subscriptionEvents.POST, {
      post: {
        event: events.CREATE,
        data: updatedPost,
      },
    });
  } else if (!updatedPost.published && post.published) {
    pubsub.publish(subscriptionEvents.DELETE_POST, {
      deletePost: {
        event: events.DELETE,
        data: updatedPost,
      },
    });
  } else if (updatedPost.published && post.published) {
    pubsub.publish(subscriptionEvents.POST, {
      post: {
        event: events.UPDATE,
        data: updatedPost,
      },
    });
  }

  return updatedPost;
};
