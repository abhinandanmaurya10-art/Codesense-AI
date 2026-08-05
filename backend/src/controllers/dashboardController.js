const mongoose = require('mongoose');
const Review = require('../models/Review');
const { ok, asyncHandler } = require('../utils/response');

const getStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const [totals] = await Review.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        averageScore: { $avg: '$result.overallScore' },
        criticalIssues: {
          $sum: {
            $size: {
              $filter: {
                input: { $ifNull: ['$result.issues', []] },
                as: 'i',
                cond: { $eq: ['$$i.severity', 'critical'] },
              },
            },
          },
        },
      },
    },
  ]);

  const languageBreakdown = await Review.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        averageScore: { $avg: '$result.overallScore' },
      },
    },
    { $sort: { count: -1 } },
    { $project: { _id: 0, language: '$_id', count: 1, averageScore: { $round: ['$averageScore', 1] } } },
  ]);

  const scoreTrend = await Review.find({ userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(12)
    .select('result.overallScore createdAt')
    .then((rows) =>
      rows
        .reverse()
        .map((r) => ({ date: r.createdAt, score: r.result?.overallScore ?? null })),
    );

  const recentReviews = await Review.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('-code')
    .then((rows) => rows.map((r) => r.toSummary()));

  return ok(res, {
    totalReviews: totals?.totalReviews ?? 0,
    completedReviews: totals?.completed ?? 0,
    failedReviews: totals?.failed ?? 0,
    averageScore: totals?.averageScore ? Math.round(totals.averageScore * 10) / 10 : 0,
    criticalIssues: totals?.criticalIssues ?? 0,
    languageBreakdown,
    scoreTrend,
    recentReviews,
  });
});

module.exports = { getStats };
