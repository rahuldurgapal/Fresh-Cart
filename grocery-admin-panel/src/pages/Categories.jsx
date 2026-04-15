import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Toast from '../components/Toast';
import '../pages/Products.css';

import API_BASE from '../config.js';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', count: '', status: 'Active', image: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? <span className="status-badge success">Active</span>
      : <span className="status-badge warning">Inactive</span>;
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/categories/get.php`);
      const data = await response.json();
      if (data.records) {
        setCategories(data.records);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', count: '0', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setFormData({ ...category });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`${API_BASE}/api/categories/delete.php?id=${id}`, {
          method: 'DELETE'
        });
        if(response.ok) {
          setToast({ show: true, message: 'Category deleted!', type: 'success' });
          fetchCategories();
        } else {
          const err = await response.json();
          setToast({ show: true, message: err.message || 'Failed to delete category.', type: 'error' });
        }
      } catch(e) { console.error(e); }
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
        const payload = { id: editingId, name: formData.name, status: formData.status };
        const response = await fetch(`${API_BASE}/api/categories/update.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(response.ok) {
            setToast({ show: true, message: 'Category updated successfully!', type: 'success' });
            fetchCategories();
            setIsModalOpen(false);
        } else {
            const d = await response.json();
            alert(d.message || 'Failed to update category');
        }
      } catch(e) { console.error(e); alert('Network Error'); }
    } else {
      // Create new Category via API
      try {
        const payload = {
          name: formData.name,
          status: formData.status,
          image: formData.image // Base64
        };

        const response = await fetch(`${API_BASE}/api/categories/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(response.ok) {
            setToast({ show: true, message: 'New Category added successfully!', type: 'success' });
            fetchCategories(); // Refresh list from DB
            setIsModalOpen(false);
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to add category');
        }
      } catch (error) {
         console.error(error);
         alert("Network error");
      }
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Pagination Logic
  const totalItems = filteredCategories.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your products into logical groups.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Category Name</th>
                <th>Products Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '40px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cat) => {
                
                const imageUrl = cat.image_path 
                    ? (cat.image_path.startsWith('http') ? cat.image_path : `${API_BASE}${cat.image_path}`) 
                    : cat.image; // fallback

                return (
                <tr key={cat.id}>
                  <td>
                    {imageUrl ? (
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden' }}>
                            <img src={imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tag size={18} color="var(--brand-primary)" />
                        </div>
                    )}
                  </td>
                  <td><span className="cell-text-bold">{cat.name}</span></td>
                  <td><span className="cell-text">{cat.count || 0} items</span></td>
                  <td>{getStatusBadge(cat.status)}</td>
                  <td style={{ textAlign: 'right', paddingRight: '40px' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="icon-btn-small" onClick={() => openEditModal(cat)}><Edit2 size={16} /></button>
                      <button className="icon-btn-small delete" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )})}
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Initial Products Count</label>
            <input 
              type="number" 
              className="form-input" 
              required
              value={formData.count}
              onChange={(e) => setFormData({...formData, count: e.target.value})}
              disabled={!!editingId} // Usually count is auto-calculated by backend, so disable if editing
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              className="form-input filter-select" 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category Thumbnail</label>
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
              {editingId ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
    </div>
  );
};

export default Categories;
