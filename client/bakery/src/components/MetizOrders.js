// src/components/MetizOrders.js

import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import {
    Container,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

function MetizOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [editingOrder, setEditingOrder] = useState(null);
    const [completionTime, setCompletionTime] = useState('');

    const allowedStatuses = ['на рассмотрении', 'выполняется', 'выполнен', 'отменён'];

    const [openDialog, setOpenDialog] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchDate, searchStatus, orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/metiz/orders');
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении заказов:', err);
            setError('Не удалось загрузить заказы.');
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (searchDate) {
            filtered = filtered.filter((order) =>
                new Date(order.date_of_ordering).toISOString().startsWith(searchDate)
            );
        }

        if (searchStatus) {
            filtered = filtered.filter((order) => order.status === searchStatus);
        }

        setFilteredOrders(filtered);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: response.data.status } : order
                )
            );
            alert('Статус заказа успешно обновлён.');
        } catch (err) {
            console.error('Ошибка при обновлении статуса заказа:', err);
            alert('Не удалось обновить статус заказа.');
        }
    };

    const handleOpenDialog = (orderId) => {
        setOrderToDelete(orderId);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOrderToDelete(null);
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;

        try {
            await axios.delete(`/api/orders/${orderToDelete}`);
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderToDelete));
            alert('Заказ успешно удалён.');
        } catch (err) {
            console.error('Ошибка при удалении заказа:', err);
            alert('Не удалось удалить заказ.');
        } finally {
            handleCloseDialog();
        }
    };

    const handleUpdateCompletionTime = async (orderId) => {
        if (!completionTime.trim()) {
            alert('Введите корректное время выполнения');
            return;
        }

        try {
            const response = await axios.put(`/api/orders/${orderId}/completion-time`, { completion_time: completionTime });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, completion_time: response.data.order.completion_time } : order
                )
            );
            alert('Время выполнения успешно обновлено');
        } catch (error) {
            console.error('Ошибка при обновлении времени выполнения заказа:', error);
            alert('Не удалось обновить время выполнения заказа.');
        } finally {
            setEditingOrder(null);
        }
    };

    if (loading)
        return (
            <Container sx={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ marginTop: '20px' }}>
                    Загрузка заказов...
                </Typography>
            </Container>
        );

    if (error)
        return (
            <Container sx={{ marginTop: '50px' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Управление Заказами
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, marginBottom: '20px' }}>
                <TextField
                    label="Поиск по дате (ГГГГ-ММ-ДД)"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    fullWidth
                />
                <Select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value="">Все статусы</MenuItem>
                    {allowedStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                        setSearchDate('');
                        setSearchStatus('');
                    }}
                >
                    Сбросить фильтры
                </Button>
            </Box>

            {filteredOrders.length === 0 ? (
                <Alert severity="info">Нет доступных заказов.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Заказа</TableCell>
                                <TableCell>Время выполнения</TableCell>
                                <TableCell>Имя Клиента</TableCell>
                                <TableCell>Телефон Клиента</TableCell>
                                <TableCell>Пожелания</TableCell>
                                <TableCell>Адрес Доставки</TableCell>
                                <TableCell>Товары</TableCell>
                                <TableCell>Общая Стоимость</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Дата Заказа</TableCell>

                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>
                                        {editingOrder === order.id ? (
                                            <TextField
                                                value={completionTime}
                                                onChange={(e) => setCompletionTime(e.target.value)}
                                                onBlur={() => handleUpdateCompletionTime(order.id)}
                                                placeholder="Введите время"
                                                fullWidth
                                            />
                                        ) : (
                                            <Typography
                                                onClick={() => {
                                                    setEditingOrder(order.id);
                                                    setCompletionTime(order.completion_time || '');
                                                }}
                                                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                {order.completion_time || 'Не указано'}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.User.name} {order.User.surname}
                                    </TableCell>
                                    <TableCell>{order.User.phone}</TableCell>
                                    <TableCell>{order.description}</TableCell>
                                    <TableCell>{order.delivery_address}</TableCell>
                                    <TableCell>
                                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                            {order.OrderItems.map((item) => (
                                                <li key={item.id}>
                                                    {item.Product.name} x {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                    <TableCell>{order.total_cost} ₽</TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            variant="standard"
                                            fullWidth
                                        >
                                            {allowedStatuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.date_of_ordering).toLocaleString()}
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleOpenDialog(order.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Подтверждение Удаления</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleDeleteOrder} color="error" variant="contained">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );

}

export default MetizOrders;
