import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import * as XLSX from 'xlsx';
import './Dashboard.css';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instagramurl: '',
    followers: '',
    averageView: '',
    er: '',
    language: '',
    gender: '',
    state: '',
    city: '',
    contactno: '',
    commercial: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    name: '',
    instagramurl: '',
    followers: '',
    averageView: '',
    er: '',
    language: '',
    gender: '',
    state: '',
    city: '',
    contactno: '',
    commercial: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/data');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.name) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.instagramurl) {
      filtered = filtered.filter(item => 
        item.instagramurl?.toLowerCase().includes(filters.instagramurl.toLowerCase())
      );
    }

    if (filters.followers) {
      const followersValue = parseInt(filters.followers);
      if (!isNaN(followersValue)) {
        filtered = filtered.filter(item => {
          const itemFollowers = item.followers || 0;
          return itemFollowers >= followersValue;
        });
      }
    }

    if (filters.averageView) {
      const averageViewValue = parseInt(filters.averageView);
      if (!isNaN(averageViewValue)) {
        filtered = filtered.filter(item => {
          const itemAverageView = item.averageView || 0;
          return itemAverageView >= averageViewValue;
        });
      }
    }

    if (filters.er) {
      const erValue = parseFloat(filters.er);
      if (!isNaN(erValue)) {
        filtered = filtered.filter(item => {
          const itemEr = item.er || 0;
          return itemEr >= erValue;
        });
      }
    }

    if (filters.language) {
      filtered = filtered.filter(item => 
        item.language?.toLowerCase().includes(filters.language.toLowerCase())
      );
    }

    if (filters.gender) {
      filtered = filtered.filter(item => 
        item.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.state) {
      filtered = filtered.filter(item => 
        item.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
    }

    if (filters.city) {
      filtered = filtered.filter(item => 
        item.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.contactno) {
      filtered = filtered.filter(item => 
        item.contactno?.toLowerCase().includes(filters.contactno.toLowerCase())
      );
    }

    if (filters.commercial) {
      filtered = filtered.filter(item => 
        item.commercial?.toLowerCase().includes(filters.commercial.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await api.post('/api/data/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert(`Successfully imported ${response.data.count} record(s)!`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/data/import-url', { url: importUrl });
      alert(`Successfully imported ${response.data.count} record(s) from URL!`);
      setImportUrl('');
      setShowUrlImport(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error importing from URL');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (editingItem) {
        await api.put(`/api/data/${editingItem._id}`, formData);
        alert('Data updated successfully!');
      } else {
        await api.post('/api/data', formData);
        alert('Data added successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      instagramurl: item.instagramurl || '',
      followers: item.followers || '',
      averageView: item.averageView || '',
      er: item.er || '',
      language: item.language || '',
      gender: item.gender || '',
      state: item.state || '',
      city: item.city || '',
      contactno: item.contactno || '',
      commercial: item.commercial || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/data/${id}`);
      alert('Entry deleted successfully!');
      fetchData();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(item => item._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const exportSelected = () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one record to export.');
      return;
    }

    const selectedData = data.filter(item => selectedIds.has(item._id));
    exportToExcel(selectedData, 'selected-data');
  };

  const exportAll = () => {
    if (data.length === 0) {
      alert('No data to export!');
      return;
    }
    exportToExcel(data, 'all-data');
  };

  const exportToExcel = (dataToExport, filename) => {
    const exportData = dataToExport.map(item => ({
      'Name': item.name || '',
      'Instagram URL': item.instagramurl || '',
      'Followers': item.followers || 0,
      'Average View': item.averageView || 0,
      'ER (%)': item.er || 0,
      'Language': item.language || '',
      'Gender': item.gender || '',
      'State': item.state || '',
      'City': item.city || '',
      'Contact No': item.contactno || '',
      'Commercial': item.commercial || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}-${dateStr}.xlsx`);
    alert(`Exported ${dataToExport.length} record(s) successfully!`);
  };

  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const ids = Array.from(selectedIds);
      if (ids.length > 0) {
        await api.post('/api/data/delete-multiple', { ids });
        alert('Selected data cleared!');
      } else {
        // Delete all
        for (let item of data) {
          await api.delete(`/api/data/${item._id}`);
        }
        alert('All data cleared!');
      }
      fetchData();
      setSelectedIds(new Set());
    } catch (error) {
      alert(error.response?.data?.message || 'Error clearing data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      instagramurl: '',
      followers: '',
      averageView: '',
      er: '',
      language: '',
      gender: '',
      state: '',
      city: '',
      contactno: '',
      commercial: ''
    });
    setEditingItem(null);
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      instagramurl: '',
      followers: '',
      averageView: '',
      er: '',
      language: '',
      gender: '',
      state: '',
      city: '',
      contactno: '',
      commercial: ''
    });
  };

  const formatNumber = (num) => {
    if (num === 0 || !num) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    if (number >= 1000) {
      return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return number.toString();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-body">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2 className="rosterra-logo">Rosterra</h2>
          </div>
          <div className="nav-user">
            <span className="user-email">{user?.email}</span>
            <span className="user-role" style={{ marginLeft: '10px', padding: '4px 8px', backgroundColor: user?.role === 'admin' ? '#4CAF50' : '#2196F3', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
              {user?.role === 'admin' ? 'Admin' : 'Talent Manager'}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Rosterra Dashboard</h1>
            <div className="data-stats">
              <div className="stat-item">
                <span className="stat-label">Total Records:</span>
                <span className="stat-value">{data.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Selected:</span>
                <span className="stat-value">{selectedIds.size}</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            {(user?.role === 'admin' || user?.role === 'talent_manager') && (
              <div className="upload-card">
                <h3>📤 Upload Excel File</h3>
                <p>Upload an Excel (.xlsx, .xls) file to import data</p>
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => document.getElementById('excelFileInput').click()}
                >
                  Choose Excel File
                </button>
              </div>
            )}

            <div className="action-buttons-top">
              {(user?.role === 'admin' || user?.role === 'talent_manager') && (
                <button className="btn btn-secondary" onClick={() => { resetForm(); setShowModal(true); }}>
                  ➕ Add Data Manually
                </button>
              )}
              {user?.role === 'admin' && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/admin/signup')}
                >
                  👤 Create User
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={exportSelected}
                disabled={selectedIds.size === 0}
              >
                📥 Export Selected
              </button>
              <button className="btn btn-secondary" onClick={exportAll}>
                📥 Export All
              </button>
              {(user?.role === 'admin' || user?.role === 'talent_manager') && (
                <button className="btn btn-secondary" onClick={() => setShowUrlImport(!showUrlImport)}>
                  🔗 Import from URL
                </button>
              )}
              {user?.role === 'admin' && (
                <button className="btn btn-danger" onClick={clearAllData}>
                  🗑️ Clear Selected
                </button>
              )}
            </div>
            {showUrlImport && (user?.role === 'admin' || user?.role === 'talent_manager') && (
              <div className="url-import-section" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h4>Import from URL (Google Sheets, CSV, Excel)</h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="Enter URL (e.g., Google Sheets link, CSV URL, Excel file URL)"
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <button className="btn btn-primary" onClick={handleUrlImport} disabled={loading}>
                    Import
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setShowUrlImport(false); setImportUrl(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <h3>🔍 Filter Data</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="filterName">Name</label>
                <input
                  type="text"
                  id="filterName"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  placeholder="Search by name..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterInstagramUrl">Instagram URL</label>
                <input
                  type="text"
                  id="filterInstagramUrl"
                  value={filters.instagramurl}
                  onChange={(e) => setFilters({ ...filters, instagramurl: e.target.value })}
                  placeholder="Filter by Instagram URL..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterFollowers">Min Followers</label>
                <input
                  type="number"
                  id="filterFollowers"
                  value={filters.followers}
                  onChange={(e) => setFilters({ ...filters, followers: e.target.value })}
                  placeholder="Minimum followers..."
                  min="0"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterAverageView">Min Average View</label>
                <input
                  type="number"
                  id="filterAverageView"
                  value={filters.averageView}
                  onChange={(e) => setFilters({ ...filters, averageView: e.target.value })}
                  placeholder="Minimum average view..."
                  min="0"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterEr">Min ER (%)</label>
                <input
                  type="number"
                  id="filterEr"
                  value={filters.er}
                  onChange={(e) => setFilters({ ...filters, er: e.target.value })}
                  placeholder="Minimum ER (%)..."
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterLanguage">Language</label>
                <input
                  type="text"
                  id="filterLanguage"
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  placeholder="Filter by language..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterGender">Gender</label>
                <select
                  id="filterGender"
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="filterState">State</label>
                <input
                  type="text"
                  id="filterState"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  placeholder="Filter by state..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterCity">City</label>
                <input
                  type="text"
                  id="filterCity"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Filter by city..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterContactNo">Contact No</label>
                <input
                  type="text"
                  id="filterContactNo"
                  value={filters.contactno}
                  onChange={(e) => setFilters({ ...filters, contactno: e.target.value })}
                  placeholder="Filter by contact no..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterCommercial">Commercial</label>
                <input
                  type="text"
                  id="filterCommercial"
                  value={filters.commercial}
                  onChange={(e) => setFilters({ ...filters, commercial: e.target.value })}
                  placeholder="Filter by commercial..."
                />
              </div>
            </div>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {/* Data Table */}
          <div className="table-section">
            <div className="table-header">
              <h3>Data Table</h3>
              <div className="table-controls">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                    onChange={handleSelectAll}
                  />
                  <span>Select All</span>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Name</th>
                      <th>Instagram URL</th>
                      <th>Followers</th>
                      <th>Average View</th>
                      <th>ER (%)</th>
                      <th>Language</th>
                      <th>Gender</th>
                      <th>State</th>
                      <th>City</th>
                      <th>Contact No</th>
                      <th>Commercial</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="empty-message">
                          No data available. Upload an Excel file or add data manually.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map(item => (
                        <tr
                          key={item._id}
                          className={selectedIds.has(item._id) ? 'selected' : ''}
                        >
                          <td className="checkbox-col">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item._id)}
                              onChange={() => handleSelectRow(item._id)}
                            />
                          </td>
                          <td>{item.name || 'N/A'}</td>
                          <td>
                            {item.instagramurl ? (
                              <a href={item.instagramurl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                                {item.instagramurl.length > 30 ? item.instagramurl.substring(0, 30) + '...' : item.instagramurl}
                              </a>
                            ) : 'N/A'}
                          </td>
                          <td>{item.followers || 0}</td>
                          <td>{item.averageView || 0}</td>
                          <td>{item.er ? `${item.er}%` : 'N/A'}</td>
                          <td>{item.language || 'N/A'}</td>
                          <td>{item.gender || 'N/A'}</td>
                          <td>{item.state || 'N/A'}</td>
                          <td>{item.city || 'N/A'}</td>
                          <td>{item.contactno || 'N/A'}</td>
                          <td>{item.commercial || 'N/A'}</td>
                          <td className="actions-col">
                            {user?.role === 'admin' && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleEdit(item)}
                                  title="Edit"
                                  style={{ 
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="btn-icon delete"
                                  onClick={() => handleDelete(item._id)}
                                  title="Delete"
                                  style={{ 
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                            {user?.role !== 'admin' && (
                              <span style={{ color: '#999', fontSize: '13px' }}>View Only</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal show" onClick={(e) => e.target.className === 'modal show' && setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Data' : 'Add New Data'}</h3>
              <span className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                &times;
              </span>
            </div>
            <form className="data-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inputName">Name *</label>
                  <input
                    type="text"
                    id="inputName"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inputInstagramUrl">Instagram URL</label>
                  <input
                    type="url"
                    id="inputInstagramUrl"
                    name="instagramurl"
                    value={formData.instagramurl}
                    onChange={handleInputChange}
                    placeholder="Enter Instagram URL"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inputFollowers">Followers</label>
                  <input
                    type="number"
                    id="inputFollowers"
                    name="followers"
                    value={formData.followers}
                    onChange={handleInputChange}
                    placeholder="Enter number of followers"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inputAverageView">Average View</label>
                  <input
                    type="number"
                    id="inputAverageView"
                    name="averageView"
                    value={formData.averageView}
                    onChange={handleInputChange}
                    placeholder="Enter average view"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inputEr">ER (%)</label>
                  <input
                    type="number"
                    id="inputEr"
                    name="er"
                    value={formData.er}
                    onChange={handleInputChange}
                    placeholder="Enter engagement rate (%)"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inputLanguage">Language</label>
                  <input
                    type="text"
                    id="inputLanguage"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="Enter language"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inputGender">Gender *</label>
                  <select
                    id="inputGender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="inputState">State *</label>
                  <input
                    type="text"
                    id="inputState"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inputCity">City *</label>
                  <input
                    type="text"
                    id="inputCity"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inputContactNo">Contact No</label>
                  <input
                    type="tel"
                    id="inputContactNo"
                    name="contactno"
                    value={formData.contactno}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inputCommercial">Commercial</label>
                  <input
                    type="text"
                    id="inputCommercial"
                    name="commercial"
                    value={formData.commercial}
                    onChange={handleInputChange}
                    placeholder="Enter commercial"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


