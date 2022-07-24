const Post = {
  /**
   * user mapping fn
   * in the Post, user : { id, name }
   * but whenever we fetch post, this fn would transform (map) the { id, name } into user obj
   * at the client side, we are getting user obj
   * @param parent - post
   * @param args
   * @param db
   * @param info
   * @returns user
   */
  user(post, args, { db }, info) {
    // console.log(parent); // Post
    const {
      user: { id, name },
    } = { ...post };
    return db.users.find((user) => user.id === id || user.name === name);
  },
};
const User = {
  /**
   * this fn would add posts into user if the user in the post is matched with userId
   * @param user
   * @param args
   * @param db
   * @param info
   * @returns [post]
   */
  posts(user, args, { db }, info) {
    const { id } = { ...user };
    return db.posts.filter((post) => post.user.id === id);
  },
};

export { Post, User };
