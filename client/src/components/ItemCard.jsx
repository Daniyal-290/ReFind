import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import './ItemCard.css';

const ItemCard = ({ item }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <Link to={`/items/${item._id}`} className="item-card">
            <div className="item-card-image">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.title} />
                ) : (
                    <div className="item-card-placeholder">
                        <span>📦</span>
                    </div>
                )}
                <span className={`badge badge-${item.type}`}>
                    {item.type}
                </span>
                <span className={`item-status badge badge-${item.status}`}>
                    {item.status}
                </span>
            </div>

            <div className="item-card-content">
                <h3 className="item-card-title">{item.title}</h3>
                <p className="item-card-category">{item.category}</p>

                <div className="item-card-meta">
                    <span className="meta-item">
                        <FiMapPin />
                        {item.location}
                    </span>
                    <span className="meta-item">
                        <FiClock />
                        {formatDate(item.createdAt)}
                    </span>
                </div>

                {item.posted_by && (
                    <div className="item-card-author">
                        <FiUser />
                        <span>{item.posted_by.username || 'Anonymous'}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ItemCard;
