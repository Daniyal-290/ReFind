import { FiSearch, FiX } from 'react-icons/fi';
import './ItemFilters.css';

const categories = [
    'All',
    'Electronics',
    'Documents/IDs',
    'Keys',
    'Bags/Wallets',
    'Clothing',
    'Books',
    'Other'
];

const ItemFilters = ({ filters, setFilters }) => {
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleTypeChange = (type) => {
        setFilters(prev => ({ ...prev, type: prev.type === type ? '' : type }));
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value === 'All' ? '' : e.target.value;
        setFilters(prev => ({ ...prev, category }));
    };

    const clearFilters = () => {
        setFilters({ search: '', type: '', category: '', location: '' });
    };

    const hasActiveFilters = filters.search || filters.type || filters.category || filters.location;

    return (
        <div className="filters-container">
            <div className="search-bar">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search for lost or found items..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                {filters.search && (
                    <button
                        className="search-clear"
                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    >
                        <FiX />
                    </button>
                )}
            </div>

            <div className="filter-controls">
                <div className="type-toggle">
                    <button
                        className={`type-btn ${filters.type === 'lost' ? 'active lost' : ''}`}
                        onClick={() => handleTypeChange('lost')}
                    >
                        🔴 Lost
                    </button>
                    <button
                        className={`type-btn ${filters.type === 'found' ? 'active found' : ''}`}
                        onClick={() => handleTypeChange('found')}
                    >
                        🟢 Found
                    </button>
                </div>

                <select
                    value={filters.category || 'All'}
                    onChange={handleCategoryChange}
                    className="form-select filter-select"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Location..."
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="form-input filter-input"
                />

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                        <FiX /> Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default ItemFilters;
