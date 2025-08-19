import { db, storage, COLLECTIONS, VEHICLE_STATUS } from './config.js';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

class DatabaseManager {
  constructor() {
    this.vehiclesCollection = collection(db, COLLECTIONS.VEHICLES);
  }

  // 獲取所有可售車輛
  async getAvailableVehicles() {
    try {
      console.log('開始載入可售車輛列表...');
      const q = query(
        this.vehiclesCollection,
        where('status', '==', VEHICLE_STATUS.AVAILABLE),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const vehicles = [];
      
      querySnapshot.forEach((doc) => {
        vehicles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('成功載入車輛列表，共', vehicles.length, '輛車');
      return { success: true, vehicles };
    } catch (error) {
      console.error('獲取車輛列表失敗 - 詳細錯誤:', error);
      console.error('錯誤代碼:', error.code);
      console.error('錯誤訊息:', error.message);
      return { success: false, error: `無法載入車輛資料: ${error.message}` };
    }
  }

  // 根據條件搜尋車輛
  async searchVehicles(filters) {
    try {
      let q = query(
        this.vehiclesCollection,
        where('status', '==', VEHICLE_STATUS.AVAILABLE)
      );

      // 如果有品牌篩選
      if (filters.brand) {
        q = query(q, where('brand', '==', filters.brand));
      }

      // 如果有類型篩選
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      // 按創建時間排序
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let vehicles = [];
      
      querySnapshot.forEach((doc) => {
        vehicles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // 前端篩選價格範圍和關鍵字（因為 Firestore 查詢限制）
      if (filters.minPrice || filters.maxPrice || filters.keyword) {
        vehicles = vehicles.filter(vehicle => {
          let match = true;

          // 價格範圍篩選
          if (filters.minPrice && vehicle.price < filters.minPrice) {
            match = false;
          }
          if (filters.maxPrice && vehicle.price > filters.maxPrice) {
            match = false;
          }

          // 關鍵字搜尋
          if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            const searchableText = `${vehicle.brand} ${vehicle.model} ${vehicle.description || ''}`.toLowerCase();
            if (!searchableText.includes(keyword)) {
              match = false;
            }
          }

          return match;
        });
      }

      return { success: true, vehicles };
    } catch (error) {
      console.error('搜尋車輛失敗:', error);
      return { success: false, error: '搜尋失敗' };
    }
  }

  // 獲取單一車輛詳細資料
  async getVehicleById(vehicleId) {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          vehicle: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return { success: false, error: '找不到該車輛' };
      }
    } catch (error) {
      console.error('獲取車輛詳細資料失敗:', error);
      return { success: false, error: '無法載入車輛詳細資料' };
    }
  }

  // 獲取用戶的車輛
  async getUserVehicles(userId) {
    try {
      console.log('開始載入用戶車輛，用戶ID:', userId);
      const q = query(
        this.vehiclesCollection,
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const vehicles = [];
      
      querySnapshot.forEach((doc) => {
        vehicles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('成功載入用戶車輛，共', vehicles.length, '輛車');
      return { success: true, vehicles };
    } catch (error) {
      console.error('獲取用戶車輛失敗 - 詳細錯誤:', error);
      console.error('錯誤代碼:', error.code);
      console.error('錯誤訊息:', error.message);
      return { success: false, error: `無法載入車輛資料: ${error.message}` };
    }
  }

  // 新增車輛
  async addVehicle(vehicleData, imageFiles) {
    try {
      console.log('開始新增車輛流程:', vehicleData);
      
      // 上傳圖片
      const imageUrls = [];
      if (imageFiles && imageFiles.length > 0) {
        console.log('開始上傳圖片，共', imageFiles.length, '張');
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(`上傳第 ${i + 1} 張圖片:`, file.name, '大小:', file.size);
          const imageUrl = await this.uploadImage(file, `vehicles/${Date.now()}_${i}`);
          if (imageUrl) {
            imageUrls.push(imageUrl);
            console.log(`第 ${i + 1} 張圖片上傳成功:`, imageUrl);
          } else {
            console.error(`第 ${i + 1} 張圖片上傳失敗`);
          }
        }
      }

      // 準備車輛資料
      const vehicleDoc = {
        ...vehicleData,
        images: imageUrls,
        status: VEHICLE_STATUS.AVAILABLE,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('準備寫入資料庫的車輛資料:', vehicleDoc);

      // 新增到資料庫
      const docRef = await addDoc(this.vehiclesCollection, vehicleDoc);
      
      console.log('車輛成功寫入資料庫，ID:', docRef.id);
      
      return { 
        success: true, 
        vehicleId: docRef.id,
        message: '車輛新增成功' 
      };
    } catch (error) {
      console.error('新增車輛失敗 - 詳細錯誤:', error);
      console.error('錯誤代碼:', error.code);
      console.error('錯誤訊息:', error.message);
      return { success: false, error: `新增車輛失敗: ${error.message}` };
    }
  }

  // 更新車輛資料
  async updateVehicle(vehicleId, updateData, newImageFiles, deleteImageUrls) {
    try {
      // 刪除指定的舊圖片
      if (deleteImageUrls && deleteImageUrls.length > 0) {
        for (const imageUrl of deleteImageUrls) {
          await this.deleteImage(imageUrl);
        }
      }

      // 上傳新圖片
      const newImageUrls = [];
      if (newImageFiles && newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const imageUrl = await this.uploadImage(file, `vehicles/${Date.now()}_${i}`);
          if (imageUrl) {
            newImageUrls.push(imageUrl);
          }
        }
      }

      // 準備更新資料
      const updateDoc = {
        ...updateData,
        updatedAt: new Date()
      };

      // 如果有新圖片，更新圖片陣列
      if (newImageUrls.length > 0) {
        // 獲取現有圖片列表
        const currentVehicle = await this.getVehicleById(vehicleId);
        if (currentVehicle.success) {
          const currentImages = currentVehicle.vehicle.images || [];
          // 移除要刪除的圖片，加入新圖片
          const filteredImages = currentImages.filter(img => 
            !deleteImageUrls || !deleteImageUrls.includes(img)
          );
          updateDoc.images = [...filteredImages, ...newImageUrls];
        }
      }

      // 更新資料庫
      const docRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      await updateDoc(docRef, updateDoc);
      
      return { success: true, message: '車輛資料更新成功' };
    } catch (error) {
      console.error('更新車輛失敗:', error);
      return { success: false, error: '更新車輛失敗' };
    }
  }

  // 刪除車輛
  async deleteVehicle(vehicleId) {
    try {
      // 先獲取車輛資料以刪除圖片
      const vehicleResult = await this.getVehicleById(vehicleId);
      if (vehicleResult.success && vehicleResult.vehicle.images) {
        for (const imageUrl of vehicleResult.vehicle.images) {
          await this.deleteImage(imageUrl);
        }
      }

      // 刪除資料庫記錄
      const docRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      await deleteDoc(docRef);
      
      return { success: true, message: '車輛刪除成功' };
    } catch (error) {
      console.error('刪除車輛失敗:', error);
      return { success: false, error: '刪除車輛失敗' };
    }
  }

  // 標記車輛為已售出
  async markVehicleSold(vehicleId) {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      await updateDoc(docRef, {
        status: VEHICLE_STATUS.SOLD,
        soldAt: new Date(),
        updatedAt: new Date()
      });
      
      return { success: true, message: '車輛已標記為售出' };
    } catch (error) {
      console.error('標記售出失敗:', error);
      return { success: false, error: '操作失敗' };
    }
  }

  // 上傳圖片到 Firebase Storage
  async uploadImage(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      return null;
    }
  }

  // 從 Firebase Storage 刪除圖片
  async deleteImage(imageUrl) {
    try {
      // 從 URL 中提取檔案路徑
      const url = new URL(imageUrl);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('刪除圖片失敗:', error);
    }
  }

  // 監聽車輛資料變化
  subscribeToVehicles(callback) {
    const q = query(
      this.vehiclesCollection,
      where('status', '==', VEHICLE_STATUS.AVAILABLE),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const vehicles = [];
      querySnapshot.forEach((doc) => {
        vehicles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(vehicles);
    });
  }

  // 驗證車輛資料
  validateVehicleData(data) {
    const errors = [];

    if (!data.brand || data.brand.trim() === '') {
      errors.push('品牌為必填項目');
    }

    if (!data.model || data.model.trim() === '') {
      errors.push('車型為必填項目');
    }

    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
      errors.push('請輸入有效的年份');
    }

    if (!data.price || data.price <= 0) {
      errors.push('請輸入有效的價格');
    }

    if (!data.contact || data.contact.trim() === '') {
      errors.push('聯絡方式為必填項目');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 創建全局資料庫管理器實例
export const dbManager = new DatabaseManager();
