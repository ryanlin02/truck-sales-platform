import { authManager } from './auth.js';
import { dbManager } from './database.js';
import { VEHICLE_BRANDS } from './config.js';
import { 
  formatPrice, 
  formatRelativeTime, 
  debounce, 
  showNotification,
  loadingManager,
  getUrlParams 
} from './utils.js';

class VehicleApp {
  constructor() {
    this.vehicles = [];
    this.filteredVehicles = [];
    this.currentFilters = {};
    this.init();
  }

  // 初始化應用
  async init() {
    this.initEventListeners();
    this.initBrandFilter();
    await this.loadVehicles();
    this.initUrlParams();
  }

  // 初始化事件監聽器
  initEventListeners() {
    // 登入/登出按鈕
    document.getElementById('loginBtn')?.addEventListener('click', this.showLoginModal.bind(this));
    document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout.bind(this));

    // 模態框控制
    document.getElementById('closeModal')?.addEventListener('click', this.hideLoginModal.bind(this));
    document.getElementById('closeRegisterModal')?.addEventListener('click', this.hideRegisterModal.bind(this));
    
    // 切換登入/註冊模態框
    document.getElementById('showRegister')?.addEventListener('click', this.showRegisterModal.bind(this));
    document.getElementById('showLogin')?.addEventListener('click', this.showLoginModal.bind(this));

    // 表單提交
    document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
    document.getElementById('registerForm')?.addEventListener('submit', this.handleRegister.bind(this));

    // 搜尋功能
    document.getElementById('searchBtn')?.addEventListener('click', this.handleSearch.bind(this));
    document.getElementById('searchKeyword')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });

    // 篩選功能
    document.getElementById('brandFilter')?.addEventListener('change', this.handleFilterChange.bind(this));
    document.getElementById('typeFilter')?.addEventListener('change', this.handleFilterChange.bind(this));
    document.getElementById('minPrice')?.addEventListener('input', debounce(this.handleFilterChange.bind(this), 500));
    document.getElementById('maxPrice')?.addEventListener('input', debounce(this.handleFilterChange.bind(this), 500));

    // 清除篩選
    document.getElementById('clearFilters')?.addEventListener('click', this.clearFilters.bind(this));

    // 新增車輛按鈕
    document.getElementById('addVehicleBtn')?.addEventListener('click', () => {
      window.location.href = 'add-vehicle.html';
    });

    // 模態框點擊外部關閉
    document.getElementById('loginModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'loginModal') {
        this.hideLoginModal();
      }
    });

    document.getElementById('registerModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'registerModal') {
        this.hideRegisterModal();
      }
    });

    // 認證狀態監聽
    authManager.addAuthListener(this.handleAuthStateChange.bind(this));
  }

  // 初始化品牌篩選器
  initBrandFilter() {
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
      VEHICLE_BRANDS.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
      });
    }
  }

  // 載入車輛資料
  async loadVehicles() {
    loadingManager.setLoading('vehicles', true);
    
    try {
      const result = await dbManager.getAvailableVehicles();
      if (result.success) {
        this.vehicles = result.vehicles;
        this.applyFilters();
      } else {
        showNotification('載入車輛資料失敗', 'error');
      }
    } catch (error) {
      console.error('載入車輛失敗:', error);
      showNotification('載入車輛資料失敗', 'error');
    } finally {
      loadingManager.setLoading('vehicles', false);
      this.updateLoadingState();
    }
  }

  // 更新載入狀態
  updateLoadingState() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const vehiclesList = document.getElementById('vehiclesList');
    const noVehicles = document.getElementById('noVehicles');

    if (loadingManager.isLoading('vehicles')) {
      loadingSpinner?.classList.remove('hidden');
      vehiclesList?.classList.add('hidden');
      noVehicles?.classList.add('hidden');
    } else {
      loadingSpinner?.classList.add('hidden');
      vehiclesList?.classList.remove('hidden');
      
      if (this.filteredVehicles.length === 0) {
        noVehicles?.classList.remove('hidden');
      } else {
        noVehicles?.classList.add('hidden');
      }
    }
  }

  // 處理搜尋
  async handleSearch() {
    const keyword = document.getElementById('searchKeyword')?.value.trim();
    this.currentFilters.keyword = keyword;
    await this.applyFilters();
  }

  // 處理篩選變更
  async handleFilterChange() {
    const brandFilter = document.getElementById('brandFilter');
    const typeFilter = document.getElementById('typeFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    this.currentFilters = {
      ...this.currentFilters,
      brand: brandFilter?.value || '',
      type: typeFilter?.value || '',
      minPrice: minPrice?.value ? parseInt(minPrice.value) : '',
      maxPrice: maxPrice?.value ? parseInt(maxPrice.value) : ''
    };

    await this.applyFilters();
  }

  // 應用篩選條件
  async applyFilters() {
    loadingManager.setLoading('filter', true);
    
    try {
      const result = await dbManager.searchVehicles(this.currentFilters);
      if (result.success) {
        this.filteredVehicles = result.vehicles;
        this.renderVehicles();
        this.updateVehicleCount();
      } else {
        showNotification('篩選失敗', 'error');
      }
    } catch (error) {
      console.error('篩選失敗:', error);
      showNotification('篩選失敗', 'error');
    } finally {
      loadingManager.setLoading('filter', false);
      this.updateLoadingState();
    }
  }

  // 清除所有篩選
  clearFilters() {
    // 清除表單
    document.getElementById('searchKeyword').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';

    // 重設篩選條件
    this.currentFilters = {};
    
    // 重新顯示所有車輛
    this.filteredVehicles = this.vehicles;
    this.renderVehicles();
    this.updateVehicleCount();
  }

  // 渲染車輛列表
  renderVehicles() {
    const vehiclesList = document.getElementById('vehiclesList');
    if (!vehiclesList) return;

    if (this.filteredVehicles.length === 0) {
      vehiclesList.innerHTML = '';
      return;
    }

    vehiclesList.innerHTML = this.filteredVehicles.map(vehicle => this.createVehicleCard(vehicle)).join('');
    
    // 添加點擊事件
    vehiclesList.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', () => {
        const vehicleId = card.dataset.vehicleId;
        window.location.href = `vehicle-detail.html?id=${vehicleId}`;
      });
    });
  }

  // 創建車輛卡片HTML
  createVehicleCard(vehicle) {
    const primaryImage = vehicle.images && vehicle.images.length > 0 
      ? vehicle.images[0] 
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjAgODBIMTgwVjEyMEgxMjBWODBaIiBmaWxsPSIjRTVFNUU1Ii8+CjwvdXZnPgo=';

    return `
      <div class="vehicle-card card" data-vehicle-id="${vehicle.id}">
        <img src="${primaryImage}" alt="${vehicle.brand} ${vehicle.model}" class="vehicle-image" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjAgODBIMTgwVjEyMEgxMjBWODBaIiBmaWxsPSIjRTVFNUU1Ii8+PC9zdmc+Cg=='">
        <div class="vehicle-info">
          <h3 class="vehicle-title">${vehicle.brand} ${vehicle.model}</h3>
          <div class="vehicle-price">${formatPrice(vehicle.price)}</div>
          <div class="vehicle-details">
            <div class="vehicle-detail">
              <span>年份</span>
              <span>${vehicle.year}年</span>
            </div>
            ${vehicle.mileage ? `
            <div class="vehicle-detail">
              <span>里程</span>
              <span>${vehicle.mileage.toLocaleString()} km</span>
            </div>
            ` : ''}
            ${vehicle.engine ? `
            <div class="vehicle-detail">
              <span>引擎</span>
              <span>${vehicle.engine}</span>
            </div>
            ` : ''}
          </div>
          <div class="vehicle-meta">
            <span>發佈者：${vehicle.ownerName || '匿名'}</span>
            <span>${formatRelativeTime(vehicle.createdAt)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 更新車輛數量顯示
  updateVehicleCount() {
    const vehicleCount = document.getElementById('vehicleCount');
    if (vehicleCount) {
      vehicleCount.textContent = `共 ${this.filteredVehicles.length} 輛車`;
    }
  }

  // 顯示登入模態框
  showLoginModal() {
    this.hideRegisterModal();
    document.getElementById('loginModal')?.classList.remove('hidden');
  }

  // 隱藏登入模態框
  hideLoginModal() {
    document.getElementById('loginModal')?.classList.add('hidden');
    this.clearLoginForm();
  }

  // 顯示註冊模態框
  showRegisterModal() {
    this.hideLoginModal();
    document.getElementById('registerModal')?.classList.remove('hidden');
  }

  // 隱藏註冊模態框
  hideRegisterModal() {
    document.getElementById('registerModal')?.classList.add('hidden');
    this.clearRegisterForm();
  }

  // 清除登入表單
  clearLoginForm() {
    document.getElementById('loginForm')?.reset();
  }

  // 清除註冊表單
  clearRegisterForm() {
    document.getElementById('registerForm')?.reset();
  }

  // 處理登入
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loadingManager.setLoading('login', true);
    
    try {
      const result = await authManager.loginUser(email, password);
      if (result.success) {
        this.hideLoginModal();
        showNotification('登入成功', 'success');
      } else {
        authManager.showError(result.error);
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      authManager.showError('登入失敗');
    } finally {
      loadingManager.setLoading('login', false);
    }
  }

  // 處理註冊
  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const company = document.getElementById('regCompany').value;

    loadingManager.setLoading('register', true);
    
    try {
      const result = await authManager.registerUser(email, password, name, company);
      if (result.success) {
        this.hideRegisterModal();
        showNotification('註冊成功，歡迎加入！', 'success');
      } else {
        authManager.showError(result.error);
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      authManager.showError('註冊失敗');
    } finally {
      loadingManager.setLoading('register', false);
    }
  }

  // 處理登出
  async handleLogout() {
    const result = await authManager.logoutUser();
    if (result.success) {
      showNotification('已登出', 'success');
    }
  }

  // 處理認證狀態變更
  handleAuthStateChange(user) {
    // 認證狀態改變時的處理邏輯
    if (user) {
      console.log('用戶已登入:', user.displayName);
    } else {
      console.log('用戶已登出');
    }
  }

  // 初始化URL參數
  initUrlParams() {
    const params = getUrlParams();
    
    // 如果有搜尋參數，設定搜尋條件
    if (params.search) {
      document.getElementById('searchKeyword').value = params.search;
      this.currentFilters.keyword = params.search;
    }
    
    if (params.brand) {
      document.getElementById('brandFilter').value = params.brand;
      this.currentFilters.brand = params.brand;
    }
    
    if (params.type) {
      document.getElementById('typeFilter').value = params.type;
      this.currentFilters.type = params.type;
    }

    // 如果有篩選條件，重新應用篩選
    if (Object.keys(this.currentFilters).length > 0) {
      this.applyFilters();
    }
  }
}

// 當DOM載入完成時初始化應用
document.addEventListener('DOMContentLoaded', () => {
  window.vehicleApp = new VehicleApp();
});