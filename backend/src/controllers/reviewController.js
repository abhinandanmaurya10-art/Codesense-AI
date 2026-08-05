const Review = require('../models/Review');
const ApiError = require('../utils/apiError');
const { ok, created, asyncHandler } = require('../utils/response');
const { reviewCode } = require('../services/geminiService');
const { objectIdSchema } = require('../utils/validators');

const createReview = asyncHandler(async (req, res) => {
  const { code, language, title, context, source = 'textarea', fileName = '', isMarked = false } = req.body;

  const review = await Review.create({
    userId: req.user._id,
    title: title || `${language} review — ${new Date().toISOString().slice(0, 10)}`,
    language,
    code,
    context: context || '',
    source,
    fileName,
    isMarked,
    status: 'pending',
  });

  try {
    const result = await reviewCode({ code, language, title, context });
    review.result = result;
    review.status = 'completed';
    review.errorMessage = '';
    await review.save();
  } catch (err) {
    review.status = 'failed';
    review.errorMessage = err.message || 'AI review failed';
    await review.save();
    throw ApiError.internal(review.errorMessage);
  }

  return created(res, { review }, 'Review completed');
});

const listReviews = asyncHandler(async (req, res) => {
  const { page, limit, language, status, source, isMarked } = req.validatedQuery;
  const filter = { userId: req.user._id };
  if (language) filter.language = language;
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (isMarked !== undefined) filter.isMarked = isMarked;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-code'),
    Review.countDocuments(filter),
  ]);

  return ok(res, {
    reviews: items.map((r) => r.toSummary()),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

const getReview = asyncHandler(async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const review = await Review.findOne({ _id: id, userId: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  return ok(res, { review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const deleted = await Review.findOneAndDelete({ _id: id, userId: req.user._id });
  if (!deleted) throw ApiError.notFound('Review not found');
  return ok(res, null, 'Review deleted');
});

module.exports = { createReview, listReviews, getReview, deleteReview };
