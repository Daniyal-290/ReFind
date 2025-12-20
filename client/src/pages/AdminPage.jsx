import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FiUsers, FiPackage, FiAlertTriangle, FiTrash2, FiUserX, FiUserCheck, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminPage.css';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'items') fetchItems();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers({ limit: 50 });
            setUsers(response.data.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getItems({ limit: 50 });
            setItems(response.data.data);
        } catch (error) {
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId) => {
        try {
            const response = await adminAPI.banUser(userId);
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isBanned: response.data.data.isBanned } : u
            ));
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Delete this item and all associated claims?')) return;

        try {
            await adminAPI.deleteItem(itemId);
            setItems(prev => prev.filter(i => i._id !== itemId));
            toast.success('Item deleted');
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading && !stats) {
        return (
            <div className="page flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="admin-header">
                    <h1>⚙️ Admin Panel</h1>
                    <p>Manage users and moderate content</p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers /> Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        <FiPackage /> Items
                    </button>
                </div>

                {activeTab === 'overview' && stats && (
                    <div className="admin-overview">
                        <div className="stats-grid">
                            <div className="admin-stat-card">
                                <FiUsers className="stat-icon" />
                                <div>
                                    <h3>{stats.users.total}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                            <div className="admin-stat-card warning">
                                <FiAlertTriangle className="stat-icon" />
                                <div>
                                    <h3>{stats.users.banned}</h3>
                                    <p>Banned Users</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <FiPackage className="stat-icon" />
                                <div>
                                    <h3>{stats.items.total}</h3>
                                    <p>Total Items</p>
                                </div>
                            </div>
                            <div className="admin-stat-card success">
                                <FiPackage className="stat-icon" />
                                <div>
                                    <h3>{stats.items.resolved}</h3>
                                    <p>Resolved Items</p>
                                </div>
                            </div>
                        </div>

                        <div className="stats-breakdown">
                            <div className="breakdown-card">
                                <h4>Items by Type</h4>
                                <div className="breakdown-items">
                                    <div className="breakdown-item">
                                        <span>🔴 Lost Items</span>
                                        <span>{stats.items.lost}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>🟢 Found Items</span>
                                        <span>{stats.items.found}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="breakdown-card">
                                <h4>Claims Summary</h4>
                                <div className="breakdown-items">
                                    <div className="breakdown-item">
                                        <span>Total Claims</span>
                                        <span>{stats.claims.total}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Pending Review</span>
                                        <span className="text-warning">{stats.claims.pending}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-table-container">
                        <div className="table-header">
                            <h3>User Management</h3>
                            <button className="btn btn-ghost btn-sm" onClick={fetchUsers}>
                                <FiRefreshCw /> Refresh
                            </button>
                        </div>
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} className={user.isBanned ? 'banned' : ''}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{formatDate(user.createdAt)}</td>
                                            <td>
                                                <span className={`badge ${user.isBanned ? 'badge-rejected' : 'badge-active'}`}>
                                                    {user.isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                                                    onClick={() => handleBanUser(user._id)}
                                                >
                                                    {user.isBanned ? <><FiUserCheck /> Unban</> : <><FiUserX /> Ban</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="admin-table-container">
                        <div className="table-header">
                            <h3>Content Moderation</h3>
                            <button className="btn btn-ghost btn-sm" onClick={fetchItems}>
                                <FiRefreshCw /> Refresh
                            </button>
                        </div>
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Posted By</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item._id}>
                                            <td className="item-title-cell">
                                                <a href={`/items/${item._id}`} target="_blank" rel="noopener noreferrer">
                                                    {item.title}
                                                </a>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${item.type}`}>{item.type}</span>
                                            </td>
                                            <td>{item.posted_by?.username || 'Unknown'}</td>
                                            <td>{formatDate(item.createdAt)}</td>
                                            <td>
                                                <span className={`badge badge-${item.status}`}>{item.status}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteItem(item._id)}
                                                >
                                                    <FiTrash2 /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
