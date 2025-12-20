import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import ItemFilters from '../components/ItemFilters';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        category: '',
        location: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    useEffect(() => {
        fetchItems();
    }, [filters]);

    const fetchItems = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 12,
                ...(filters.search && { search: filters.search }),
                ...(filters.type && { type: filters.type }),
                ...(filters.category && { category: filters.category }),
                ...(filters.location && { location: filters.location })
            };

            const response = await itemsAPI.getAll(params);
            setItems(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <section className="hero">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Lost Something? <span className="gradient-text">Find It Here.</span>
                        </h1>
                        <p className="hero-subtitle">
                            ReFind connects lost items with their owners through a secure claim system.
                            Report lost items, post found belongings, and help your community.
                        </p>
                        {isAuthenticated ? (
                            <Link to="/post" className="btn btn-primary btn-lg">
                                <FiPlus /> Post an Item
                            </Link>
                        ) : (
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                Get Started
                            </Link>
                        )}
                    </div>
                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-number">{pagination.total}+</span>
                            <span className="stat-label">Active Items</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">🔒</span>
                            <span className="stat-label">Secure Claims</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Always Online</span>
                        </div>
                    </div>
                </section>

                <ItemFilters filters={filters} setFilters={setFilters} />

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : items.length > 0 ? (
                    <>
                        <div className="items-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {items.map(item => (
                                <ItemCard key={item._id} item={item} />
                            ))}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchItems(pagination.page - 1)}
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchItems(pagination.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <FiPackage className="empty-state-icon" />
                        <h3 className="empty-state-title">No Items Found</h3>
                        <p className="empty-state-text">
                            {filters.search || filters.type || filters.category
                                ? 'Try adjusting your filters to find more items.'
                                : 'Be the first to post an item!'}
                        </p>
                        {isAuthenticated && (
                            <Link to="/post" className="btn btn-primary mt-4">
                                <FiPlus /> Post an Item
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
