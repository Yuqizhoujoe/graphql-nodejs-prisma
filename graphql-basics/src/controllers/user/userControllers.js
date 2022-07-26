import { v4 as uuid } from "uuid";

export const getUser = async (parents, arg, { db }, info) => {
  const { id } = arg;
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) throw new Error("User no found!");

  return user;
};
export const getUsersSearchByName = async (parent, arg, { db }) => {
  let query = "";
  if (arg.query) query = query.toLowerCase();
  const users = await db.user.findMany({
    where: {
      name: {
        search: query,
      },
    },
    include: {
      Post: true,
    },
  });
  return users;
};
export const createUser = async (parent, arg, { db, pubsub }, info) => {
  const { user } = { ...arg };
  const { name, email, age } = { ...user };

  const emailExisted = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (emailExisted) throw new Error("Email already taken");

  const newUser = {
    name,
    email,
    age,
    id: uuid(),
  };

  return db.user.create({
    data: {
      ...newUser,
    },
  });
};
export const deleteUser = async (parent, arg, { db, pubsub }, info) => {
  const { id } = { ...arg };

  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) throw new Error("User not found!!");

  const deleteUser = await db.user.delete({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      posts: true,
    },
  });

  return deleteUser;
};
export const updateUser = async (parent, arg, { db, pubsub }, info) => {
  const { id, data } = { ...arg };
  const { email: updatedEmail } = data;

  const user = await db.user.findFirst({
    where: {
      id,
    },
  });
  if (!user) throw new Error("User not found!!");

  const emailTaken = await db.user.findFirst({
    where: {
      email: updatedEmail,
    },
  });
  if (emailTaken)
    throw new Error("Email has been taken, please try another email");

  const updateUser = await db.user.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
  return updateUser;
};
