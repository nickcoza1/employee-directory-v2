export default {
  test: {
    include: ['**/*.test.js'], // make detection explicit
    watch: false,              // avoid watch mode during CI/one-off runs
  },
};