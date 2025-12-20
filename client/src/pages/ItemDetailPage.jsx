import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemsAPI, claimsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiClock, FiUser, FiArrowLeft, FiSend, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ItemDetailPage.css';

const ItemDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimMessage, setClaimMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await itemsAPI.getById(id);
            setItem(response.data.data);
        } catch (error) {
            toast.error('Item not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (e) => {
        e.preventDefault();
        if (!claimMessage.trim()) {
            toast.error('Please provide a message explaining your claim');
            return;
        }

        setSubmitting(true);
        try {
            await claimsAPI.create({
                item_id: id,
                request_message: claimMessage
            });
            toast.success('Claim request sent successfully!');
            setShowClaimModal(false);
            setClaimMessage('');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send claim request';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isOwner = user && item?.posted_by?._id === user._id;

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!item) {
        return null;
    }

    return (
        <div className="page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FiArrowLeft /> Back
                </button>

                <div className="item-detail">
                    <div className="item-detail-image">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.title} />
                        ) : (
                            <div className="image-placeholder">
                                <span>📦</span>
                                <p>No image available</p>
                            </div>
                        )}
                    </div>

                    <div className="item-detail-content">
                        <div className="item-badges">
                            <span className={`badge badge-${item.type}`}>
                                {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                            </span>
                            <span className={`badge badge-${item.status}`}>
                                {item.status}
                            </span>
                        </div>

                        <h1 className="item-title">{item.title}</h1>
                        <p className="item-category">{item.category}</p>

                        <div className="item-meta">
                            <div className="meta-row">
                                <FiMapPin />
                                <span>{item.location}</span>
                            </div>
                            <div className="meta-row">
                                <FiClock />
                                <span>{formatDate(item.createdAt)}</span>
                            </div>
                            <div className="meta-row">
                                <FiUser />
                                <span>Posted by {item.posted_by?.username || 'Anonymous'}</span>
                            </div>
                        </div>

                        <div className="item-description">
                            <h3>Description</h3>
                            <p>{item.description}</p>
                        </div>

                        <div className="item-actions">
                            {!isAuthenticated ? (
                                <Link to="/login" className="btn btn-primary btn-lg">
                                    Login to Claim
                                </Link>
                            ) : isOwner ? (
                                <div className="owner-notice">
                                    <FiCheck /> This is your item
                                </div>
                            ) : item.status === 'resolved' ? (
                                <div className="resolved-notice">
                                    <FiX /> This item has been resolved
                                </div>
                            ) : (
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setShowClaimModal(true)}
                                >
                                    <FiSend />
                                    {item.type === 'found' ? 'Claim This Item' : 'I Found This Item'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {showClaimModal && (
                    <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Send Claim Request</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowClaimModal(false)}
                                >
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleClaim}>
                                <div className="modal-body">
                                    <p className="modal-info">
                                        Explain how you can prove this item belongs to you. The owner will review your request.
                                    </p>
                                    <div className="form-group">
                                        <label className="form-label">Your Message</label>
                                        <textarea
                                            className="form-textarea"
                                            value={claimMessage}
                                            onChange={(e) => setClaimMessage(e.target.value)}
                                            placeholder="e.g., I can describe the item in detail, I have a photo, etc."
                                            rows={4}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowClaimModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Sending...' : 'Send Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemDetailPage;
