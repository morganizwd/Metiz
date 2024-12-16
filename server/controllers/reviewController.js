const { Review, User, Metiz, Order } = require('../models/models');

class ReviewController {

    async createReview(req, res) {
        try {
            const { rating, short_review, description, orderId } = req.body;
            const userId = req.user.userId;

            if (!userId) {
                return res.status(401).json({ message: 'Неавторизованный пользователь' });
            }

            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            if (order.status !== 'выполнен') {
                return res.status(400).json({ message: 'Отзыв можно оставить только для выполненных заказов' });
            }

            const existingReview = await Review.findOne({ where: { orderId } });
            if (existingReview) {
                return res.status(400).json({ message: 'Отзыв для данного заказа уже существует' });
            }

            const metizId = order.metizId;

            const review = await Review.create({
                rating,
                short_review,
                description,
                orderId,
                metizId,
                userId,
            });

            res.status(201).json(review);
        } catch (error) {
            console.error('Ошибка при создании отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getReviewById(req, res) {
        try {
            const { id } = req.params;

            const review = await Review.findByPk(id, {
                include: [
                    { model: Order },
                    { model: Metiz },
                    { model: User, attributes: ['name', 'surname'] },
                ],
            });

            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            res.json(review);
        } catch (error) {
            console.error('Ошибка при получении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getAllReviews(req, res) {
        try {
            const reviews = await Review.findAll({
                include: [
                    { model: Order },
                    { model: Metiz },
                    { model: User, attributes: ['name', 'surname'] },
                ],
                order: [['createdAt', 'DESC']],
            });

            res.json(reviews);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async updateReview(req, res) {
        try {
            const { id } = req.params;
            const { rating, short_review, description } = req.body;
            const userId = req.user.userId;

            const review = await Review.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            if (review.userId !== userId) {
                return res.status(403).json({ message: 'Нет доступа для редактирования этого отзыва' });
            }

            await review.update({
                rating,
                short_review,
                description,
            });

            res.json(review);
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const review = await Review.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            if (review.userId !== userId) {
                return res.status(403).json({ message: 'Нет доступа для удаления этого отзыва' });
            }

            await review.destroy();

            res.status(200).json({ message: 'Отзыв успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getReviewsByMetiz(req, res) {
        try {
            const { metizId } = req.params;

            const reviews = await Review.findAll({
                where: { metizId },
                include: [
                    { model: Order },
                    { model: Metiz },
                    { model: User, attributes: ['name', 'surname'] },
                ],
                order: [['createdAt', 'DESC']],
            });

            res.json(reviews);
        } catch (error) {
            console.error('Ошибка при получении отзывов метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ReviewController();