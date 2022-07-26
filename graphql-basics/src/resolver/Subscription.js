import { subscriptionEvents } from "../common/constants";

const Subscription = {
  count: {
    subscribe(_, arg, { pubsub }, info) {
      let count = 0;

      setInterval(() => {
        count++;
        // 1st arg: event name
        // 2nd arg: obj data
        pubsub.publish("count", {
          count,
        });
      }, 1000);

      return pubsub.asyncIterator("count");
    },
  },

  post: {
    subscribe(_, arg, { pubsub }, info) {
      return pubsub.asyncIterator(subscriptionEvents.POST);
    },
  },
  deletePost: {
    subscribe(_, arg, { pubsub }, info) {
      return pubsub.asyncIterator(subscriptionEvents.DELETE_POST);
    },
  },
};

export default Subscription;
