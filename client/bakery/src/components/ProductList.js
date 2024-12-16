import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Box, Button, List, ListItem, ListItemText, IconButton, Divider, Card, CardContent, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function ProductList() {
    const { authData } = useContext(AuthContext);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/api/products/metiz/${authData.user.id}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Ошибка при получении списка товаров:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await axios.delete(`/api/products/${id}`);
                setProducts(products.filter((product) => product.id !== id));
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
            }
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Управление товарами</Typography>
                <Button
                    component={Link}
                    to="/metiz-admin/products/add"
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                >
                    Добавить новый товар
                </Button>
            </Box>
            <List>
                {products.map((product) => (
                    <React.Fragment key={product.id}>
                        <ListItem alignItems="flex-start" sx={{ padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
                            <Card sx={{ display: 'flex', width: '100%' }}>
                                {product.photo && (
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 150 }}
                                        image={`http://localhost:5000${product.photo}`}
                                        alt={product.name}
                                    />
                                )}
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <CardContent>
                                        <Typography component="div" variant="h5">
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {product.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" mt={1}>
                                            Цена: {product.price} ₽
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}>
                                        <IconButton component={Link} to={`/metiz-admin/products/edit/${product.id}`} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(product.id)} color="secondary">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Card>
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Container>
    );
}

export default ProductList;
