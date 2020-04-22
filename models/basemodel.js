module.exports = {
  schema: {
    created: {
      type: Date,
      index: true,
    },
    updated: {
      type: Date,
      index: true,
    },
    deleted: {
      type: Date,
      index: true,
    },
  },
};
