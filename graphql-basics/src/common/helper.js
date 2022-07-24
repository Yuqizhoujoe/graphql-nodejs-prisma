export const isMatchPost = (post, query) => {
  const { postId, postTitle, userId, userName } = query;
  return (
    post.id === postId ||
    post.title === postTitle ||
    post.user.id === userId ||
    post.user.name === userName
  );
};
