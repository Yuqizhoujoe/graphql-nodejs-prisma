const Query = {
  add(parent, arg, { db }, info) {
    const { numbers } = arg;
    return numbers.reduce((prev, curr) => prev + curr, 0);
  },
  me() {
    return {
      id: "jojo1",
      name: "JoJo",
      email: "kevinyuqi@gmail.com",
      age: 27,
    };
  },
  getUser(parents, arg, { db }, info) {
    const { id, name } = arg;
    const user = db.users.find((user) => user.name === name || user.id === id);

    if (!user) throw new Error("User no found!");

    return user;
  },
  getUsers(parent, arg, { db }) {
    let { query } = { ...arg };
    if (!query) {
      return db.users;
    }

    query = query.toLowerCase();
    return db.users.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(query);
      const emailMatch = user.email.toLowerCase().includes(query);
      return nameMatch || emailMatch;
    });
  },
  getPost(parent, arg, { db }, info) {
    // getPost(id: ID!, title: String!): Post!
    // console.log(arg);  { id: '1', title: 'jojo' }
    let { id } = { ...arg };
    return db.posts.find((post) => post.id === id);
  },
  getPosts(parent, arg, { db }) {
    let { query } = { ...arg };
    if (!query) return db.posts;

    query = query.toLowerCase();
    return db.posts.filter((post) => {
      const { title, description } = post;
      const titleMatch = title.toLowerCase().includes(query);
      const descriptionMatch = description.toLowerCase().includes(query);
      return titleMatch || descriptionMatch;
    });
  },
};

export default Query;
