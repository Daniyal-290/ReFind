import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI, claimsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiInbox, FiSend, FiCheck, FiX, FiPlus, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('items');
    const [myItems, setMyItems] = useState([]);
    const [sentClaims, setSentClaims] = useState([]);
    const [receivedClaims, setReceivedClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, sentRes, receivedRes] = await Promise.all([
                itemsAPI.getMyItems(),
                claimsAPI.getSent(),
                claimsAPI.getReceived()
            ]);
            setMyItems(itemsRes.data.data);
            setSentClaims(sentRes.data.data);
            setReceivedClaims(receivedRes.data.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            await itemsAPI.delete(id);
            setMyItems(prev => prev.filter(item => item._id !== id));
            toast.success('Item deleted');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const handleClaimAction = async (claimId, action) => {
        try {
            if (action === 'approve') {
                await claimsAPI.approve(claimId);
                toast.success('Claim approved! Contact details shared.');
            } else {
                await claimsAPI.reject(claimId);
                toast.success('Claim rejected');
            }
            fetchData();
        } catch (error) {
            toast.error(`Failed to ${action} claim`);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="dashboard-header">
                    <h1>My Dashboard</h1>
                    <p>Welcome back, {user?.username}!</p>
                </div>

                <div className="dashboard-stats">
                    <div className="stat-card" onClick={() => setActiveTab('items')}>
                        <FiPackage className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{myItems.length}</span>
                            <span className="stat-name">My Items</span>
                        </div>
                    </div>
                    <div className="stat-card" onClick={() => setActiveTab('sent')}>
                        <FiSend className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{sentClaims.length}</span>
                            <span className="stat-name">Sent Claims</span>
                        </div>
                    </div>
                    <div className="stat-card" onClick={() => setActiveTab('received')}>
                        <FiInbox className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{receivedClaims.filter(c => c.status === 'pending').length}</span>
                            <span className="stat-name">Pending Claims</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        <FiPackage /> My Items
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        <FiSend /> Sent Claims
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        <FiInbox /> Received Claims
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'items' && (
                        <div className="tab-content">
                            {myItems.length > 0 ? (
                                <div className="items-list">
                                    {myItems.map(item => (
                                        <div key={item._id} className="list-item">
                                            <Link to={`/items/${item._id}`} className="list-item-info">
                                                <div className="list-item-image">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.title} />
                                                    ) : (
                                                        <span>📦</span>
                                                    )}
                                                </div>
                                                <div className="list-item-details">
                                                    <h3>{item.title}</h3>
                                                    <p>{item.category} • {item.location}</p>
                                                    <div className="list-item-badges">
                                                        <span className={`badge badge-${item.type}`}>{item.type}</span>
                                                        <span className={`badge badge-${item.status}`}>{item.status}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="list-item-actions">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteItem(item._id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FiPackage className="empty-state-icon" />
                                    <h3 className="empty-state-title">No Items Posted</h3>
                                    <p className="empty-state-text">You haven't posted any items yet.</p>
                                    <Link to="/post" className="btn btn-primary mt-4">
                                        <FiPlus /> Post an Item
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'sent' && (
                        <div className="tab-content">
                            {sentClaims.length > 0 ? (
                                <div className="claims-list">
                                    {sentClaims.map(claim => (
                                        <div key={claim._id} className="claim-card">
                                            <div className="claim-header">
                                                <Link to={`/items/${claim.item_id._id}`} className="claim-item-title">
                                                    {claim.item_id.title}
                                                </Link>
                                                <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                                            </div>
                                            <p className="claim-message">"{claim.request_message}"</p>
                                            <p className="claim-date">Sent on {formatDate(claim.createdAt)}</p>

                                            {claim.status === 'approved' && claim.finder_id && (
                                                <div className="contact-revealed">
                                                    <h4>✅ Contact Information Revealed</h4>
                                                    <div className="contact-info">
                                                        {claim.finder_id.email && (
                                                            <a href={`mailto:${claim.finder_id.email}`} className="contact-item">
                                                                <FiMail /> {claim.finder_id.email}
                                                            </a>
                                                        )}
                                                        {claim.finder_id.contact_number && (
                                                            <a href={`tel:${claim.finder_id.contact_number}`} className="contact-item">
                                                                <FiPhone /> {claim.finder_id.contact_number}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FiSend className="empty-state-icon" />
                                    <h3 className="empty-state-title">No Claims Sent</h3>
                                    <p className="empty-state-text">Browse items and send a claim request!</p>
                                    <Link to="/" className="btn btn-primary mt-4">
                                        Browse Items
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'received' && (
                        <div className="tab-content">
                            {receivedClaims.length > 0 ? (
                                <div className="claims-list">
                                    {receivedClaims.map(claim => (
                                        <div key={claim._id} className="claim-card">
                                            <div className="claim-header">
                                                <Link to={`/items/${claim.item_id._id}`} className="claim-item-title">
                                                    {claim.item_id.title}
                                                </Link>
                                                <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                                            </div>
                                            <div className="claim-from">
                                                <strong>From:</strong> {claim.claimer_id.username}
                                            </div>
                                            <p className="claim-message">"{claim.request_message}"</p>
                                            <p className="claim-date">Received on {formatDate(claim.createdAt)}</p>

                                            {claim.status === 'approved' && (
                                                <div className="contact-revealed">
                                                    <h4>Claimer's Contact</h4>
                                                    <div className="contact-info">
                                                        {claim.claimer_id.email && (
                                                            <a href={`mailto:${claim.claimer_id.email}`} className="contact-item">
                                                                <FiMail /> {claim.claimer_id.email}
                                                            </a>
                                                        )}
                                                        {claim.claimer_id.contact_number && (
                                                            <a href={`tel:${claim.claimer_id.contact_number}`} className="contact-item">
                                                                <FiPhone /> {claim.claimer_id.contact_number}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {claim.status === 'pending' && (
                                                <div className="claim-actions">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleClaimAction(claim._id, 'approve')}
                                                    >
                                                        <FiCheck /> Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleClaimAction(claim._id, 'reject')}
                                                    >
                                                        <FiX /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FiInbox className="empty-state-icon" />
                                    <h3 className="empty-state-title">No Claims Received</h3>
                                    <p className="empty-state-text">When someone claims your item, it will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
