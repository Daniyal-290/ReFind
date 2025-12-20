import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { FiUpload, FiX, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PostItemPage.css';

const categories = [
    'Electronics',
    'Documents/IDs',
    'Keys',
    'Bags/Wallets',
    'Clothing',
    'Books',
    'Other'
];

const PostItemPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        type: 'found',
        title: '',
        category: '',
        location: '',
        description: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('type', formData.type);
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('location', formData.location);
            data.append('description', formData.description);
            if (formData.image) {
                data.append('image', formData.image);
            }

            await itemsAPI.create(data);
            toast.success('Item posted successfully!');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to post item';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="post-item-container">
                    <div className="post-item-header">
                        <h1>Post an Item</h1>
                        <p>Help reunite lost items with their owners</p>
                    </div>

                    <form onSubmit={handleSubmit} className="post-item-form">
                        <div className="form-group">
                            <label className="form-label">Item Type</label>
                            <div className="type-selector">
                                <button
                                    type="button"
                                    className={`type-option ${formData.type === 'found' ? 'active found' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                                >
                                    <span className="type-icon">🟢</span>
                                    <span className="type-text">I Found an Item</span>
                                </button>
                                <button
                                    type="button"
                                    className={`type-option ${formData.type === 'lost' ? 'active lost' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                                >
                                    <span className="type-icon">🔴</span>
                                    <span className="type-text">I Lost an Item</span>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Black Leather Wallet"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Main Library, Building A"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Provide details about the item (color, brand, distinguishing features...)"
                                required
                                maxLength={1000}
                                rows={5}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Image (Optional)</label>
                            {imagePreview ? (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={removeImage}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ) : (
                                <label className="image-upload">
                                    <FiUpload className="upload-icon" />
                                    <span>Click to upload an image</span>
                                    <span className="upload-hint">Max 5MB (JPG, PNG, GIF)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        hidden
                                    />
                                </label>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner" style={{ width: 20, height: 20 }}></span>
                            ) : (
                                <>
                                    <FiSend /> Post Item
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostItemPage;
