import { v4 as uuid } from "uuid";
import { isMatchPost } from "../common/helper";
import { events, subscriptionEvents } from "../common/constants";
import _ from "lodash";

const Mutation = {
  createUser(parent, arg, { db }, info) {
    const { user } = { ...arg };
    const { name, email, age } = { ...user };

    const emailExisted = db.users.find((user) => user.email === email);

    if (emailExisted) throw new Error("Email already taken");

    const newUser = {
      name,
      email,
      age,
      id: uuid(),
    };

    db.users.push(newUser);

    return newUser;
  },
  deleteUser(parent, arg, { db }, info) {
    const {
      user: { id, name },
    } = { ...arg };
    const userIndex = db.users.findIndex(
      (user) => user.id === id || user.name === name
    );
    if (userIndex < 0) throw new Error("User not found!!");
    // grab the first item
    // since users.splice() return []
    const [deleteUser] = db.users.splice(userIndex, 1);

    db.posts = db.posts.filter((post) => post.user.id !== deleteUser.id);

    return deleteUser;
  },
  updateUser(parent, arg, { db }, info) {
    const {
      user: { id, name, email },
      data,
    } = { ...arg };
    const index = db.users.findIndex(
      (user) => user.id === id || user.name === name || user.email === email
    );

    if (index < 0) throw new Error("User not found!");

    const { email: updatedEmail } = data;
    const emailTaken = users.find((user) => user.email === updatedEmail);
    if (emailTaken)
      throw new Error("Email has been taken, please try another email");

    const oldUser = db.users[index];
    let updatedUser = {};
    updatedUser = {
      ...oldUser,
      ...data,
    };
    db.users[index] = { ...updatedUser };
    return updatedUser;
  },
  createPost(parent, arg, { db, pubsub }, info) {
    const {
      post: { title, description, published, user },
    } = { ...arg };
    const { id, name, email } = { ...user };

    const userExisted = db.users.find((user) => {
      const nameMatch = user.name === name;
      const emailMatch = user.email === email;
      const idMatch = user.id === id;
      return idMatch || nameMatch || emailMatch;
    });

    if (!userExisted) {
      throw new Error("User not existed!");
    }

    const newPost = {
      id: uuid(),
      title,
      description,
      published,
      // in the post mapping fn, we'll turn {id, name} into User
      user: {
        id: userExisted.id,
        name: userExisted.name,
      },
    };

    // if the post published: true
    // then we fire post event for the new post
    if (published) {
      // the data name should be matched with the name in the subscription resolver and schema (post)
      pubsub.publish(subscriptionEvents.POST, {
        post: {
          event: events.CREATE,
          data: newPost,
        },
      });
    }

    db.posts.push(newPost);
    return newPost;
  },
  deletePosts(parent, arg, { db, pubsub }, info) {
    const {
      post: {
        id: postId,
        title: postTitle,
        user: { id, name },
      },
    } = { ...arg };

    const publishedDeletePosts = [];
    const deletePosts = db.posts.filter((post) => {
      const match = isMatchPost(post, {
        postId,
        postTitle,
        userId: id,
        userName: name,
      });
      if (match && post.published) publishedDeletePosts.push(post);
      return match;
    });

    if (_.isEmpty(deletePosts)) throw new Error("Posts not found!");

    db.posts = db.posts.filter(
      (post) =>
        !isMatchPost(post, { postId, postTitle, userId: id, userName: name })
    );

    if (!_.isEmpty(publishedDeletePosts)) {
      const subscriptionData = publishedDeletePosts.map((post) => {
        const user = db.users.find((user) => user.id === post.user.id);
        return user ? { ...post, user } : post;
      });
      console.log(subscriptionData);
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
      pubsub.publish(subscriptionEvents.DELETE_POSTS, {
        deletePosts: {
          event: events.DELETE,
          data: subscriptionData,
        },
      });
    }

    return deletePosts;
  },
  updatePost(parent, arg, { db, pubsub }, info) {
    const { id, data } = { ...arg };

    const index = db.posts.findIndex((post) => post.id === id);
    if (index < 0) throw new Error("Post not found!");

    const oldPost = db.posts[index];
    const updatedPost = {
      ...oldPost,
      ...data,
    };
    db.posts[index] = { ...updatedPost };

    /**
     * pubsub.publish()
     * first arg: event name
     * second arg: payload
     * { subscriptionType: {event (whatever you like), data} }
     */
    if (updatedPost.published && !oldPost.published) {
      pubsub.publish(subscriptionEvents.POST, {
        post: {
          event: events.CREATE,
          data: updatedPost,
        },
      });
    } else if (!updatedPost.published && oldPost.published) {
      pubsub.publish(subscriptionEvents.DELETE_POSTS, {
        deletePosts: {
          event: events.DELETE,
          data: [updatedPost],
        },
      });
    } else if (updatedPost.published && oldPost.published) {
      pubsub.publish(subscriptionEvents.POST, {
        post: {
          event: events.UPDATE,
          data: updatedPost,
        },
      });
    }

    return updatedPost;
  },
};

export default Mutation;
