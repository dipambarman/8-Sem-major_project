import { prisma } from '../models/index.js';

// Add a review
export const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuItemId, rating, comment } = req.body;

    const review = await prisma.review.create({
      data: {
        userId,
        menuItemId: parseInt(menuItemId),
        rating: parseInt(rating),
        comment
      },
      include: {
        User: {
          select: { id: true, fullName: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add review'
    });
  }
};

// Get reviews for a menu item
export const getMenuItemReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { menuItemId: parseInt(menuItemId) },
      include: {
        User: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const aggregates = await prisma.review.aggregate({
      where: { menuItemId: parseInt(menuItemId) },
      _avg: { rating: true },
      _count: { id: true }
    });

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: aggregates._avg.rating || 0,
        totalReviews: aggregates._count.id
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reviews'
    });
  }
};

// Delete a review (Admin)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
};
