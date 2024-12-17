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
    Grid,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, TextRun } from 'docx';

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

    // Функция для экспорта в Excel
    const exportToExcel = () => {
        // Подготовка данных
        const data = filteredOrders.map((order) => ({
            'ID Заказа': order.id,
            'Время выполнения': order.completion_time || 'Не указано',
            'Имя Клиента': `${order.User.name} ${order.User.surname}`,
            'Телефон Клиента': order.User.phone,
            'Пожелания': order.description,
            'Адрес Доставки': order.delivery_address,
            'Товары': order.OrderItems.map(item => `${item.Product.name} x ${item.quantity}`).join('; '),
            'Общая Стоимость (₽)': order.total_cost,
            'Статус': order.status,
            'Дата Заказа': new Date(order.date_of_ordering).toLocaleString(),
        }));

        // Создание рабочей книги и листа
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');

        // Генерация буфера и сохранение файла
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'metiz_orders_report.xlsx');
    };

    // Функция для экспорта в Word
    const exportToWord = async () => {
        // Создание таблицы
        const tableRows = [
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph('ID Заказа')] }),
                    new DocxTableCell({ children: [new Paragraph('Время выполнения')] }),
                    new DocxTableCell({ children: [new Paragraph('Имя Клиента')] }),
                    new DocxTableCell({ children: [new Paragraph('Телефон Клиента')] }),
                    new DocxTableCell({ children: [new Paragraph('Пожелания')] }),
                    new DocxTableCell({ children: [new Paragraph('Адрес Доставки')] }),
                    new DocxTableCell({ children: [new Paragraph('Товары')] }),
                    new DocxTableCell({ children: [new Paragraph('Общая Стоимость (₽)')] }),
                    new DocxTableCell({ children: [new Paragraph('Статус')] }),
                    new DocxTableCell({ children: [new Paragraph('Дата Заказа')] }),
                ],
            }),
        ];

        filteredOrders.forEach(order => {
            tableRows.push(new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph(order.id.toString())] }),
                    new DocxTableCell({ children: [new Paragraph(order.completion_time || 'Не указано')] }),
                    new DocxTableCell({ children: [new Paragraph(`${order.User.name} ${order.User.surname}`)] }),
                    new DocxTableCell({ children: [new Paragraph(order.User.phone)] }),
                    new DocxTableCell({ children: [new Paragraph(order.description || '—')] }),
                    new DocxTableCell({ children: [new Paragraph(order.delivery_address)] }),
                    new DocxTableCell({ children: [new Paragraph(order.OrderItems.map(item => `${item.Product.name} x ${item.quantity}`).join('; '))] }),
                    new DocxTableCell({ children: [new Paragraph(order.total_cost.toString())] }),
                    new DocxTableCell({ children: [new Paragraph(order.status)] }),
                    new DocxTableCell({ children: [new Paragraph(new Date(order.date_of_ordering).toLocaleString())] }),
                ],
            }));
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: 'Отчет по заказам Metiz',
                        heading: 'Title',
                        alignment: 'CENTER',
                    }),
                    new Paragraph({ text: '', spacing: { after: 200 } }), // Пустая строка
                    new DocxTable({
                        rows: tableRows,
                        width: {
                            size: 100,
                            type: 'pct',
                        },
                    }),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'metiz_orders_report.docx');
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

            <Box sx={{ display: 'flex', gap: 2, marginBottom: '20px', flexWrap: 'wrap' }}>
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
                    sx={{ minWidth: '150px' }}
                >
                    Сбросить фильтры
                </Button>
            </Box>

            <Box sx={{ marginBottom: '20px', display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={exportToExcel}
                >
                    Экспорт в Excel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={exportToWord}
                >
                    Экспорт в Word
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
                                    <TableCell>{order.description || '—'}</TableCell>
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
