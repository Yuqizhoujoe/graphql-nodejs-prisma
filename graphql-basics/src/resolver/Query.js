import {
  getUser,
  getUsersSearchByName,
} from "../controllers/user/userControllers";
import {
  getPost,
  getPostsSearchByTitle,
} from "../controllers/post/postControllers";

const Query = {
  getUser,
  getUsers: getUsersSearchByName,
  getPost,
  getPosts: getPostsSearchByTitle,
};

export default Query;
