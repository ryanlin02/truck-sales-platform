// 工具函數庫

// 格式化價格顯示
export function formatPrice(price) {
  if (!price) return '價格面議';
  
  const numPrice = Number(price);
  if (isNaN(numPrice)) return '價格面議';
  
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice);
}

// 格式化日期顯示
export function formatDate(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date.seconds * 1000);
  
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

// 格式化相對時間（例如：2小時前）
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date.seconds * 1000);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins}分鐘前`;
  if (diffHours < 24) return `${diffHours}小時前`;
  if (diffDays < 7) return `${diffDays}天前`;
  
  return formatDate(dateObj);
}

// 檢查圖片檔案格式
export function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '僅支援 JPG, PNG, WebP 格式的圖片' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: '圖片檔案大小不能超過 5MB' };
  }
  
  return { valid: true };
}

// 檢查多個圖片檔案
export function validateImageFiles(files) {
  const maxFiles = 10;
  
  if (files.length > maxFiles) {
    return { valid: false, error: `最多只能上傳 ${maxFiles} 張圖片` };
  }
  
  for (let file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }
  }
  
  return { valid: true };
}

// 生成圖片預覽URL
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 壓縮圖片
export function compressImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 計算新的尺寸
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 繪製並壓縮圖片
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // 創建新的 File 對象
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('圖片壓縮失敗'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('圖片載入失敗'));
    img.src = URL.createObjectURL(file);
  });
}

// 批次壓縮圖片
export async function compressImages(files, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
  const compressedFiles = [];
  
  for (const file of files) {
    try {
      const compressedFile = await compressImage(file, maxWidth, maxHeight, quality);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error('壓縮圖片失敗:', file.name, error);
      // 如果壓縮失敗，使用原檔案
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
}

// 防抖函數
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 節流函數
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 驗證電子郵件格式
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 驗證手機號碼格式（台灣）
export function validatePhoneNumber(phone) {
  const phoneRegex = /^09\d{8}$|^0\d{1,2}-?\d{6,8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// 清理HTML標籤
export function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// 截斷文字
export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// 產生唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 複製到剪貼簿
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('複製失敗:', err);
    return false;
  }
}

// 滾動到元素
export function scrollToElement(element, behavior = 'smooth') {
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
}

// 檢查元素是否在視窗內
export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 載入狀態管理
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
    this.updateUI();
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  isAnyLoading() {
    return Array.from(this.loadingStates.values()).some(loading => loading);
  }

  updateUI() {
    // 更新全局載入狀態
    document.body.classList.toggle('loading', this.isAnyLoading());
  }
}

// 錯誤處理
export function handleError(error, userMessage = '操作失敗') {
  console.error('Error:', error);
  
  // 顯示用戶友好的錯誤訊息
  showNotification(userMessage, 'error');
  
  // 可以在這裡添加錯誤上報邏輯
  return { success: false, error: userMessage };
}

// 通知系統
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease;
  `;
  
  // 根據類型設定背景色
  switch (type) {
    case 'error':
      notification.style.backgroundColor = '#ef4444';
      break;
    case 'success':
      notification.style.backgroundColor = '#10b981';
      break;
    case 'warning':
      notification.style.backgroundColor = '#f59e0b';
      break;
    default:
      notification.style.backgroundColor = '#3b82f6';
  }
  
  document.body.appendChild(notification);
  
  // 自動移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// 添加CSS動畫
if (!document.getElementById('utils-styles')) {
  const style = document.createElement('style');
  style.id = 'utils-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    body.loading {
      cursor: wait;
    }
    
    body.loading * {
      pointer-events: none;
    }
    
    body.loading .btn {
      opacity: 0.6;
    }
  `;
  document.head.appendChild(style);
}

// 全局載入管理器實例
export const loadingManager = new LoadingManager();

// URL參數處理
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

export function setUrlParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
}

export function removeUrlParam(key) {
  const url = new URL(window.location);
  url.searchParams.delete(key);
  window.history.replaceState({}, '', url);
}

// 本地儲存工具
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};
