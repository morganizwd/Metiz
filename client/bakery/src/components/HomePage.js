// src/components/HomePage.js

import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    CircularProgress,
    Box,
    Rating,
    InputAdornment,
    Pagination,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';

function HomePage() {
    const [metizes, setMetizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;
    const [error, setError] = useState(null);

    // Создаём мемоизированную версию функции debounce
    const debouncedFetchMetizes = useCallback(
        debounce(() => {
            fetchMetizes();
        }, 500), // Задержка 500 мс
        [searchName, searchAddress, ratingFilter, currentPage]
    );

    useEffect(() => {
        debouncedFetchMetizes();

        // Очистка debounce при размонтировании компонента или изменении зависимостей
        return debouncedFetchMetizes.cancel;
    }, [searchName, searchAddress, ratingFilter, currentPage, debouncedFetchMetizes]);

    const fetchMetizes = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
            };
            if (searchName.trim()) params.name = searchName.trim();
            if (searchAddress.trim()) params.address = searchAddress.trim();
            if (ratingFilter > 0) params.averageRating = ratingFilter;

            const response = await axios.get('/api/metiz', { params });
            setMetizes(response.data.metizes);
            setTotalPages(Math.ceil(response.data.total / itemsPerPage));
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении списка метизов:', error);
            setLoading(false);
            setError('Не удалось загрузить список метизов. Пожалуйста, попробуйте позже.');
        }
    };

    const handleResetFilters = () => {
        setSearchName('');
        setSearchAddress('');
        setRatingFilter(0);
        setCurrentPage(1);
        fetchMetizes();
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <Typography variant="h3" align="center" gutterBottom>
                Наши Метизы
            </Typography>

            {/* Секция Фильтров */}
            <Box sx={{ marginBottom: '30px' }}>
                <Grid container spacing={2}>
                    {/* Поиск по названию */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Поиск по названию"
                            variant="outlined"
                            fullWidth
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                setCurrentPage(1); // Сбросить на первую страницу при изменении фильтра
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Поиск по адресу */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Поиск по адресу"
                            variant="outlined"
                            fullWidth
                            value={searchAddress}
                            onChange={(e) => {
                                setSearchAddress(e.target.value);
                                setCurrentPage(1); // Сбросить на первую страницу при изменении фильтра
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Фильтр по рейтингу */}
                    <Grid item xs={12} sm={4}>
                        <Typography gutterBottom>Фильтр по рейтингу</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                                name="rating-filter"
                                value={ratingFilter}
                                onChange={(event, newValue) => {
                                    setRatingFilter(newValue);
                                    setCurrentPage(1); // Сбросить на первую страницу при изменении фильтра
                                }}
                            />
                            <Typography variant="body2" sx={{ marginLeft: '10px' }}>
                                {ratingFilter > 0 ? `${ratingFilter} звёзд и выше` : 'Все рейтинги'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
                    {/* Кнопка "Сбросить" остаётся, так как автоматически применяются фильтры */}
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={handleResetFilters}
                        sx={{ marginLeft: '10px' }}
                    >
                        Сбросить
                    </Button>
                </Box>
            </Box>

            {/* Отображение ошибок */}
            {error && (
                <Box sx={{ marginBottom: '20px' }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {/* Секция Метизов */}
            {loading ? (
                <Grid container justifyContent="center" alignItems="center" sx={{ height: '60vh' }}>
                    <CircularProgress />
                </Grid>
            ) : (
                <Grid container spacing={4}>
                    {metizes.length > 0 ? (
                        metizes.map((metiz) => (
                            <Grid item xs={12} sm={6} md={4} key={metiz.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: 3,
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                >
                                    {metiz.photo ? (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={`http://localhost:5000${metiz.photo}`}
                                            alt={metiz.name}
                                        />
                                    ) : (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image="https://via.placeholder.com/400x200.png?text=No+Image"
                                            alt="No Image"
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h5" component="div">
                                            {metiz.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {metiz.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Адрес: {metiz.address}
                                        </Typography>
                                        {/* Отображение рейтинга */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                            <Rating
                                                name={`rating-${metiz.id}`}
                                                value={parseFloat(metiz.averageRating)}
                                                precision={0.1}
                                                readOnly
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '8px' }}>
                                                {parseFloat(metiz.averageRating).toFixed(1)} / 5 ({metiz.reviewCount} отзывов)
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <Box sx={{ padding: '16px', textAlign: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            component={Link}
                                            to={`/metiz/${metiz.id}`}
                                        >
                                            Подробнее
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="h6" align="center">
                                Метизы не найдены.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Пагинация */}
            {metizes.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Container>
    );

}

export default HomePage;
