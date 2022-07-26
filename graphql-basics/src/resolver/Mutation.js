import {
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/user/userControllers";
import {
  createPost,
  deletePost,
  updatePost,
} from "../controllers/post/postControllers";

const Mutation = {
  createUser,
  deleteUser,
  updateUser,
  createPost,
  deletePost,
  updatePost,
};

export default Mutation;
