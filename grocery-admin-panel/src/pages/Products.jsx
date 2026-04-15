import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import './Products.css';

import API_BASE from '../config.js';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', storage_tips: '', shelf_life: '', product_type: '', category_id: '', price: '', stock: '', unit: '1 unit', image: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'In Stock': return <span className="status-badge success">In Stock</span>;
      case 'Low Stock': return <span className="status-badge warning">Low Stock</span>;
      case 'Out of Stock': return <span className="status-badge danger">Out of Stock</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const calculateStatus = (stock) => {
    const numStock = parseInt(stock);
    if (numStock <= 0) return 'Out of Stock';
    if (numStock < 50) return 'Low Stock';
    return 'In Stock';
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products/get.php`);
      const data = await response.json();
      if(data.records) setProducts(data.records);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/categories/get.php`);
      const data = await response.json();
      if(data.records) setCategories(data.records);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', storage_tips: '', shelf_life: '', product_type: '', category_id: categories.length > 0 ? categories[0].id : '', price: '', stock: '', unit: '1 unit', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      storage_tips: product.storage_tips || '',
      shelf_life: product.shelf_life || '',
      product_type: product.product_type || '',
      category_id: product.category_id || '',
      price: product.price || '',
      stock: product.stock || '',
      unit: product.unit || '1 unit',
      image: product.image_path || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`${API_BASE}/api/products/delete.php?id=${id}`, {
          method: 'DELETE'
        });
        if(response.ok) {
          setToast({ show: true, message: 'Product deleted!', type: 'success' });
          fetchProducts();
        } else {
          const err = await response.json();
          setToast({ show: true, message: err.message || 'Failed to delete product.', type: 'error' });
        }
      } catch(e) {
        console.error(e);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result }); // Save base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      try {
        const payload = {
          id: editingId,
          name: formData.name,
          description: formData.description,
          storage_tips: formData.storage_tips,
          shelf_life: formData.shelf_life,
          product_type: formData.product_type,
          category_id: formData.category_id,
          price: parseFloat(formData.price || 0),
          stock: parseInt(formData.stock || 0),
          unit: formData.unit,
          status: calculateStatus(formData.stock),
        };
        const response = await fetch(`${API_BASE}/api/products/update.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if(response.ok) {
          setToast({ show: true, message: 'Product updated successfully!', type: 'success' });
          fetchProducts();
          setIsModalOpen(false);
        } else {
          const err = await response.json();
          alert(err.message || 'Failed to update product');
        }
      } catch(e) {
        console.error(e);
        alert('Network Error');
      }
    } else {
       try {
          const payload = {
            name: formData.name,
            description: formData.description,
            storage_tips: formData.storage_tips,
            shelf_life: formData.shelf_life,
            product_type: formData.product_type,
            category_id: formData.category_id,
            price: parseFloat(formData.price || 0),
            stock: parseInt(formData.stock || 0),
            unit: formData.unit,
            status: calculateStatus(formData.stock),
            image: formData.image
          };

          const response = await fetch(`${API_BASE}/api/products/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if(response.ok) {
            setToast({ show: true, message: 'New Product created successfully!', type: 'success' });
            fetchProducts();
            setIsModalOpen(false);
          } else {
             const err = await response.json();
             alert(err.message || 'Failed to create product');
          }
       } catch (error) {
          console.error(error);
          alert('Network Error');
       }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });
  
  // Pagination Logic
  const totalItems = filteredProducts.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products Inventory</h1>
          <p className="page-subtitle">Manage your store's products, pricing, and stock levels.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="toolbar-filters">
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => {
                const imageUrl = product.image_path 
                    ? (product.image_path.startsWith('http') ? product.image_path : `${API_BASE}${product.image_path}`) 
                    : product.image; // fallback
                return (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      {imageUrl && <img src={imageUrl} alt={product.name} className="product-image" />}
                      <span className="product-name">{product.name}</span>
                    </div>
                  </td>
                  <td><span className="cell-text">{product.category_name || product.category}</span></td>
                  <td><span className="cell-text-bold">${Number(product.price).toFixed(2)}</span></td>
                  <td><span className="cell-text">{product.unit || '1 unit'}</span></td>
                  <td><span className="cell-text">{product.stock} pcs</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn-small" title="Edit" onClick={() => openEditModal(product)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn-small delete" title="Delete" onClick={() => handleDelete(product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalItems > itemsPerPage && (
          <Pagination 
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-input" 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter product details..."
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
                <label>Storage Tips</label>
                <input type="text" className="form-input" value={formData.storage_tips || ''} onChange={(e) => setFormData({...formData, storage_tips: e.target.value})} placeholder="e.g., Keep refrigerated" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
                <label>Shelf Life</label>
                <input type="text" className="form-input" value={formData.shelf_life || ''} onChange={(e) => setFormData({...formData, shelf_life: e.target.value})} placeholder="e.g., 5 Days" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
                <label>Product Type</label>
                <input type="text" className="form-input" value={formData.product_type || ''} onChange={(e) => setFormData({...formData, product_type: e.target.value})} placeholder="e.g., 100% Veg" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select 
              className="form-input filter-select" 
              required
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Select a Category</option>
              {categories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Price ($)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                className="form-input" 
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label>Stock Quantity</label>
              <input 
                type="number" 
                min="0"
                className="form-input" 
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Product Unit (e.g. 1 kg, 500g, 1 L)</label>
              <select 
                className="form-input"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                <option value="1 unit">1 unit</option>
                <option value="1 kg">1 kg</option>
                <option value="500 g">500 g</option>
                <option value="250 g">250 g</option>
                <option value="1 L">1 L</option>
                <option value="500 ml">500 ml</option>
                <option value="1 Packet">1 Packet</option>
                <option value="1 piece">1 piece</option>
                <option value="6 pcs">6 pcs</option>
                <option value="1 Dozen">1 Dozen</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Or Custom Unit</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="Enter custom unit if not in list"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input 
              type="file" 
              accept="image/*"
              className="form-input" 
              onChange={handleImageUpload}
              style={{ padding: '8px' }}
            />
            {formData.image && formData.image.startsWith('data:') && (
                <div style={{ marginTop: '10px' }}>
                    <img src={formData.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
    </div>
  );
};

export default Products;
