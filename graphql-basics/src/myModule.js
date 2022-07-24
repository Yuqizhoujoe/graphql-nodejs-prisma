// default export - you can only have one

const message = "Some message from myModule";
const name = "JoJo";
const location = "Austin";

const getGreeting = (name) => {
  return `Welcome to the course ${name}`;
};

export { message, name, getGreeting, location as default };
