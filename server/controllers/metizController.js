const { Metiz, Product, Review, User, sequelize } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class MetizController {
    async registration(req, res) {
        try {
            const {
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                password,
                address,
            } = req.body;

            const existingMetiz = await Metiz.findOne({ where: { email } });
            if (existingMetiz) {
                return res.status(400).json({ message: 'Метиз с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const metiz = await Metiz.create({
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                password: passwordHash,
                address,
                photo: req.file ? `/uploads/metiz/${req.file.filename}` : null,
            });

            res.status(201).json(metiz);
        } catch (error) {
            console.error('Ошибка при регистрации метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const metiz = await Metiz.findOne({ where: { email } });
            if (!metiz) {
                return res.status(404).json({ message: 'Метиз не найден' });
            }

            const isMatch = await bcrypt.compare(password, metiz.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { metizId: metiz.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({ token, user: metiz });
        } catch (error) {
            console.error('Ошибка при входе метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const metiz = await Metiz.findByPk(decoded.metizId);

            res.json(metiz);
        } catch (error) {
            console.error('Ошибка при аутентификации метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const { id } = req.params;

            const metiz = await Metiz.findByPk(id, {
                include: [
                    { model: Product },
                    {
                        model: Review,
                        include: [{ model: User, attributes: ['name', 'surname'] }]
                    },
                ],
            });

            if (!metiz) {
                return res.status(404).json({ message: 'Метиз не найден' });
            }

            res.json(metiz);
        } catch (error) {
            console.error('Ошибка при получении метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const { name, address, averageRating, limit, offset } = req.query;

            const whereConditions = {};
            if (name) {
                whereConditions.name = { [Op.iLike]: `%${name}%` };
            }
            if (address) {
                whereConditions.address = { [Op.iLike]: `%${address}%` };
            }

            let havingConditions = null;
            if (averageRating) {
                havingConditions = sequelize.where(
                    sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 1),
                    {
                        [Op.gte]: parseFloat(averageRating)
                    }
                );
            }

            const { rows, count } = await Metiz.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Review,
                        attributes: [],
                    },
                ],
                attributes: {
                    include: [
                        [
                            sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 1),
                            'averageRating'
                        ],
                        [
                            sequelize.fn('COUNT', sequelize.col('Reviews.id')),
                            'reviewCount'
                        ],
                    ],
                },
                group: ['Metiz.id'],
                having: havingConditions,
                order: [['name', 'ASC']],
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
                subQuery: false,
            });

            res.json({
                metizes: rows,
                total: count.length,
            });
        } catch (error) {
            console.error('Ошибка при получении списка метизов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const {
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                password,
                address,
            } = req.body;
            const metizId = req.params.id;

            const metiz = await Metiz.findByPk(metizId);
            if (!metiz) {
                return res.status(404).json({ message: 'Метиз не найден' });
            }

            let updatedData = {
                name,
                contact_person_name,
                registration_number,
                phone,
                description,
                email,
                address,
            };
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/metiz');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/metiz/${metizId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${metizId}_${req.file.originalname}`), fs.readFileSync(req.file.path));
                updatedData.photo = photoPath;
            }

            await metiz.update(updatedData);

            res.json(metiz);
        } catch (error) {
            console.error('Ошибка при обновлении метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const metiz = await Metiz.findByPk(req.params.id);
            if (!metiz) {
                return res.status(404).json({ message: 'Метиз не найден' });
            }

            await metiz.destroy();

            res.status(200).json({ message: 'Метиз успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении метиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new MetizController();
