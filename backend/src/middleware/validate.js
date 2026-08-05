const ApiError = require('../utils/apiError');

const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(
      ApiError.badRequest(
        'Validation failed',
        result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      ),
    );
  }
  req[source === 'query' ? 'validatedQuery' : source] = result.data;
  return next();
};

module.exports = validate;
