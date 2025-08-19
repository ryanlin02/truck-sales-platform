import { auth, db, COLLECTIONS } from './config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.initAuthStateListener();
  }

  // 初始化認證狀態監聽器
  initAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 獲取用戶詳細資料
        const userDoc = await this.getUserProfile(user.uid);
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userDoc
        };
      } else {
        this.currentUser = null;
      }
      
      this.updateUI();
      this.notifyAuthListeners();
    });
  }

  // 註冊新用戶
  async registerUser(email, password, displayName, company) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 更新用戶顯示名稱
      await updateProfile(user, { displayName });

      // 儲存用戶資料到 Firestore
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        email: user.email,
        displayName: displayName,
        company: company,
        createdAt: new Date(),
        isActive: true
      });

      return { success: true, user };
    } catch (error) {
      console.error('註冊失敗:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // 用戶登入
  async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('登入失敗:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // 用戶登出
  async logoutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('登出失敗:', error);
      return { success: false, error: '登出失敗，請稍後再試' };
    }
  }

  // 獲取用戶資料
  async getUserProfile(uid) {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      return null;
    }
  }

  // 檢查用戶是否已登入
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // 獲取當前用戶
  getCurrentUser() {
    return this.currentUser;
  }

  // 添加認證狀態監聽器
  addAuthListener(callback) {
    this.authListeners.push(callback);
  }

  // 移除認證狀態監聽器
  removeAuthListener(callback) {
    const index = this.authListeners.indexOf(callback);
    if (index > -1) {
      this.authListeners.splice(index, 1);
    }
  }

  // 通知所有監聽器
  notifyAuthListeners() {
    this.authListeners.forEach(callback => {
      callback(this.currentUser);
    });
  }

  // 更新UI元素
  updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myVehiclesLink = document.getElementById('myVehiclesLink');
    const addVehicleBtn = document.getElementById('addVehicleBtn');

    if (this.isAuthenticated()) {
      // 已登入狀態
      if (loginBtn) loginBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (myVehiclesLink) myVehiclesLink.classList.remove('hidden');
      if (addVehicleBtn) addVehicleBtn.classList.remove('hidden');
    } else {
      // 未登入狀態
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (myVehiclesLink) myVehiclesLink.classList.add('hidden');
      if (addVehicleBtn) addVehicleBtn.classList.add('hidden');
    }
  }

  // 錯誤訊息轉換
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return '此電子郵件已被使用';
      case 'auth/weak-password':
        return '密碼太弱，請使用至少6個字符';
      case 'auth/invalid-email':
        return '無效的電子郵件格式';
      case 'auth/user-not-found':
        return '找不到此用戶';
      case 'auth/wrong-password':
        return '密碼錯誤';
      case 'auth/too-many-requests':
        return '嘗試次數過多，請稍後再試';
      case 'auth/network-request-failed':
        return '網路連接失敗，請檢查網路連接';
      default:
        return '發生未知錯誤，請稍後再試';
    }
  }

  // 顯示錯誤訊息
  showError(message) {
    // 創建或更新錯誤提示元素
    let errorDiv = document.getElementById('auth-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'auth-error';
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fee;
        color: #c33;
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid #fcc;
        z-index: 10000;
        max-width: 300px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // 3秒後自動隱藏
    setTimeout(() => {
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    }, 3000);
  }

  // 顯示成功訊息
  showSuccess(message) {
    let successDiv = document.getElementById('auth-success');
    if (!successDiv) {
      successDiv = document.createElement('div');
      successDiv.id = 'auth-success';
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #efe;
        color: #3c3;
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid #cfc;
        z-index: 10000;
        max-width: 300px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      document.body.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
      if (successDiv) {
        successDiv.style.display = 'none';
      }
    }, 3000);
  }
}

// 創建全局認證管理器實例
export const authManager = new AuthManager();