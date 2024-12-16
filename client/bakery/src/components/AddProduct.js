import React, { useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, InputLabel } from '@mui/material';

function AddProduct() {
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
    });
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.description || !formData.price) {
            setError('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            // Предполагается, что эндпоинт для метиза добавления товара отличается
            await axios.post(`/api/products`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authData.token}`, // Добавление токена авторизации, если требуется
                },
            });
            alert('Товар успешно добавлен!');
            navigate('/metiz-admin/products'); // Обновлённый маршрут навигации
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
            setError(error.response?.data?.message || 'Ошибка при добавлении товара');
            alert(error.response?.data?.message || 'Ошибка при добавлении товара');
        }
    };

    return (
        <Container sx={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Добавить новый товар
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                {error && (
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                )}
                <TextField
                    label="Название"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    label="Описание"
                    name="description"
                    required
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
                <TextField
                    label="Цена"
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                />
                <Box>
                    <InputLabel htmlFor="photo-upload">Фото</InputLabel>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ marginTop: '10px' }}
                    />
                </Box>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ padding: '10px 20px', fontSize: '16px' }}
                >
                    Добавить товар
                </Button>
            </Box>
        </Container>
    );
}

export default AddProduct;
