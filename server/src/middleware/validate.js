const { AppError } = require('../utils/helpers');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const issues = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(new AppError('Validasi input gagal: ' + issues.join(', '), 422, issues));
      }
      next(err);
    }
  };
}

module.exports = { validate };
