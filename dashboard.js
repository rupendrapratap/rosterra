// Data Management Dashboard
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.filteredData = [...this.data];
        this.currentEditId = null;
        this.selectedIds = new Set();
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.renderTable();
        this.updateStats();
    }

    // Load data from localStorage
    loadData() {
        const stored = localStorage.getItem('tableData');
        return stored ? JSON.parse(stored) : [];
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('tableData', JSON.stringify(this.data));
        this.filteredData = this.applyFilters();
        this.renderTable();
        this.updateStats();
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Attach event listeners
    attachEventListeners() {
        // Excel file upload
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Add data button
        const addBtn = document.getElementById('addDataBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Export buttons
        const exportSelected = document.getElementById('exportSelectedBtn');
        const exportAll = document.getElementById('exportAllBtn');
        
        if (exportSelected) {
            exportSelected.addEventListener('click', () => this.exportSelected());
        }
        
        if (exportAll) {
            exportAll.addEventListener('click', () => this.exportAll());
        }

        // Clear data button
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }

        // Filter inputs
        const filterInputs = ['filterName', 'filterAge', 'filterContentType', 'filterCity', 'filterState', 'filterGender'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters());
                element.addEventListener('change', () => this.applyFilters());
            }
        });

        // Clear filters
        const clearFilters = document.getElementById('clearFiltersBtn');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // Modal
        const modal = document.getElementById('dataModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('dataForm');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveDataEntry();
            });
        }

        // Select all checkbox
        const selectAllHeader = document.getElementById('selectAllHeader');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        
        if (selectAllHeader) {
            selectAllHeader.addEventListener('change', (e) => {
                this.selectAll(e.target.checked);
            });
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.selectAll(e.target.checked);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // Handle Excel file upload
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = document.getElementById('fileName');
        if (fileName) {
            fileName.textContent = `Selected: ${file.name}`;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                // Process and add data
                const processed = jsonData.map(row => {
                    // Map common column names
                    const entry = {
                        id: this.generateId(),
                        name: this.getField(row, ['name', 'Name', 'NAME', 'fullname', 'Full Name']),
                        age: parseInt(this.getField(row, ['age', 'Age', 'AGE'])),
                        gender: this.getField(row, ['gender', 'Gender', 'GENDER', 'sex', 'Sex']),
                        contentType: this.getField(row, ['contenttype', 'Content Type', 'content_type', 'type', 'Type']),
                        city: this.getField(row, ['city', 'City', 'CITY']),
                        state: this.getField(row, ['state', 'State', 'STATE']),
                        createdAt: new Date().toISOString()
                    };
                    
                    // Only add if has name
                    if (entry.name) {
                        return entry;
                    }
                    return null;
                }).filter(item => item !== null);

                // Add to existing data
                this.data = [...this.data, ...processed];
                this.saveData();
                this.showNotification(`Successfully imported ${processed.length} record(s)!`);
                
                // Reset file input
                event.target.value = '';
                if (fileName) {
                    fileName.textContent = '';
                }
            } catch (error) {
                alert('Error reading Excel file. Please make sure it is a valid Excel file.');
                console.error(error);
            }
        };

        reader.readAsArrayBuffer(file);
    }

    // Helper to get field from row (case-insensitive)
    getField(row, possibleKeys) {
        for (let key of possibleKeys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return String(row[key]).trim();
            }
        }
        return '';
    }

    // Apply filters
    applyFilters() {
        const nameFilter = document.getElementById('filterName').value.toLowerCase();
        const ageFilter = document.getElementById('filterAge').value;
        const contentTypeFilter = document.getElementById('filterContentType').value.toLowerCase();
        const cityFilter = document.getElementById('filterCity').value.toLowerCase();
        const stateFilter = document.getElementById('filterState').value.toLowerCase();
        const genderFilter = document.getElementById('filterGender').value.toLowerCase();

        this.filteredData = this.data.filter(item => {
            // Name filter
            if (nameFilter && !item.name?.toLowerCase().includes(nameFilter)) {
                return false;
            }

            // Age filter
            if (ageFilter) {
                const age = item.age || 0;
                switch (ageFilter) {
                    case '0-18':
                        if (age > 18) return false;
                        break;
                    case '19-30':
                        if (age < 19 || age > 30) return false;
                        break;
                    case '31-45':
                        if (age < 31 || age > 45) return false;
                        break;
                    case '46-60':
                        if (age < 46 || age > 60) return false;
                        break;
                    case '60+':
                        if (age <= 60) return false;
                        break;
                }
            }

            // Content type filter
            if (contentTypeFilter && !item.contentType?.toLowerCase().includes(contentTypeFilter)) {
                return false;
            }

            // City filter
            if (cityFilter && !item.city?.toLowerCase().includes(cityFilter)) {
                return false;
            }

            // State filter
            if (stateFilter && !item.state?.toLowerCase().includes(stateFilter)) {
                return false;
            }

            // Gender filter
            if (genderFilter && item.gender?.toLowerCase() !== genderFilter) {
                return false;
            }

            return true;
        });

        this.renderTable();
        return this.filteredData;
    }

    // Clear filters
    clearFilters() {
        document.getElementById('filterName').value = '';
        document.getElementById('filterAge').value = '';
        document.getElementById('filterContentType').value = '';
        document.getElementById('filterCity').value = '';
        document.getElementById('filterState').value = '';
        document.getElementById('filterGender').value = '';
        this.applyFilters();
    }

    // Render table
    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-message">
                        No data available. Upload an Excel file or add data manually.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredData.map(item => `
            <tr class="${this.selectedIds.has(item.id) ? 'selected' : ''}">
                <td class="checkbox-col">
                    <input type="checkbox" class="row-checkbox" data-id="${item.id}" 
                           ${this.selectedIds.has(item.id) ? 'checked' : ''}>
                </td>
                <td>${this.escapeHtml(item.name || 'N/A')}</td>
                <td>${item.age || 'N/A'}</td>
                <td>${this.escapeHtml(item.gender || 'N/A')}</td>
                <td>${this.escapeHtml(item.contentType || 'N/A')}</td>
                <td>${this.escapeHtml(item.city || 'N/A')}</td>
                <td>${this.escapeHtml(item.state || 'N/A')}</td>
                <td>
                    <button class="btn-icon" onclick="dataManager.editEntry('${item.id}')" title="Edit">
                        ✏️ Edit
                    </button>
                    <button class="btn-icon delete" onclick="dataManager.deleteEntry('${item.id}')" title="Delete">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach checkbox listeners
        const checkboxes = tbody.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) {
                    this.selectedIds.add(id);
                    e.target.closest('tr').classList.add('selected');
                } else {
                    this.selectedIds.delete(id);
                    e.target.closest('tr').classList.remove('selected');
                }
                this.updateSelectedCount();
            });
        });

        this.updateSelectedCount();
    }

    // Select all rows
    selectAll(checked) {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const id = cb.getAttribute('data-id');
            const row = cb.closest('tr');
            
            if (checked) {
                this.selectedIds.add(id);
                row.classList.add('selected');
            } else {
                this.selectedIds.delete(id);
                row.classList.remove('selected');
            }
        });
        this.updateSelectedCount();
    }

    // Update stats
    updateStats() {
        const totalRecords = document.getElementById('totalRecords');
        if (totalRecords) {
            totalRecords.textContent = this.data.length;
        }
        this.updateSelectedCount();
    }

    // Update selected count
    updateSelectedCount() {
        const selectedRecords = document.getElementById('selectedRecords');
        const exportSelectedBtn = document.getElementById('exportSelectedBtn');
        
        if (selectedRecords) {
            selectedRecords.textContent = this.selectedIds.size;
        }
        
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = this.selectedIds.size === 0;
        }
    }

    // Show add modal
    showAddModal() {
        this.currentEditId = null;
        const modal = document.getElementById('dataModal');
        const form = document.getElementById('dataForm');
        const title = document.getElementById('modalTitle');
        
        if (title) title.textContent = 'Add New Data';
        if (form) form.reset();
        if (modal) modal.classList.add('show');
    }

    // Edit entry
    editEntry(id) {
        const item = this.data.find(d => d.id === id);
        if (!item) return;

        this.currentEditId = id;
        const modal = document.getElementById('dataModal');
        const form = document.getElementById('dataForm');
        const title = document.getElementById('modalTitle');
        
        if (title) title.textContent = 'Edit Data';
        
        document.getElementById('inputName').value = item.name || '';
        document.getElementById('inputAge').value = item.age || '';
        document.getElementById('inputGender').value = item.gender || '';
        document.getElementById('inputContentType').value = item.contentType || '';
        document.getElementById('inputCity').value = item.city || '';
        document.getElementById('inputState').value = item.state || '';
        
        if (modal) modal.classList.add('show');
    }

    // Save data entry
    saveDataEntry() {
        const name = document.getElementById('inputName').value.trim();
        const age = parseInt(document.getElementById('inputAge').value);
        const gender = document.getElementById('inputGender').value.trim();
        const contentType = document.getElementById('inputContentType').value.trim();
        const city = document.getElementById('inputCity').value.trim();
        const state = document.getElementById('inputState').value.trim();

        if (!name || !age || !gender || !contentType || !city || !state) {
            alert('Please fill in all required fields!');
            return;
        }

        const entry = {
            id: this.currentEditId || this.generateId(),
            name,
            age,
            gender,
            contentType,
            city,
            state,
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.data.findIndex(d => d.id === this.currentEditId);
            if (index !== -1) {
                this.data[index] = entry;
            }
        } else {
            entry.createdAt = new Date().toISOString();
            this.data.push(entry);
        }

        this.saveData();
        this.closeModal();
        this.showNotification(this.currentEditId ? 'Data updated successfully!' : 'Data added successfully!');
    }

    // Delete entry
    deleteEntry(id) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        this.data = this.data.filter(d => d.id !== id);
        this.selectedIds.delete(id);
        this.saveData();
        this.showNotification('Entry deleted successfully!');
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('dataModal');
        if (modal) modal.classList.remove('show');
        this.currentEditId = null;
    }

    // Export selected data
    exportSelected() {
        if (this.selectedIds.size === 0) {
            alert('Please select at least one record to export.');
            return;
        }

        const selectedData = this.data.filter(item => this.selectedIds.has(item.id));
        this.exportToExcel(selectedData, 'selected-data');
    }

    // Export all data
    exportAll() {
        if (this.data.length === 0) {
            alert('No data to export!');
            return;
        }

        this.exportToExcel(this.data, 'all-data');
    }

    // Export to Excel
    exportToExcel(data, filename) {
        // Prepare data for export
        const exportData = data.map(item => ({
            'Name': item.name || '',
            'Age': item.age || '',
            'Gender': item.gender || '',
            'Content Type': item.contentType || '',
            'City': item.city || '',
            'State': item.state || ''
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        
        // Generate filename with date
        const dateStr = new Date().toISOString().split('T')[0];
        const fullFilename = `${filename}-${dateStr}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, fullFilename);
        this.showNotification(`Exported ${data.length} record(s) successfully!`);
    }

    // Clear all data
    clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            return;
        }

        this.data = [];
        this.selectedIds.clear();
        this.saveData();
        this.showNotification('All data cleared!');
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize Data Manager
let dataManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dataManager = new DataManager();
    });
} else {
    dataManager = new DataManager();
}


