// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyC96bDTaPJPhnkdKdwL6Yd0xajJb-vWSoM",
  authDomain: "truck-sales-platform-2025.firebaseapp.com",
  projectId: "truck-sales-platform-2025",
  storageBucket: "truck-sales-platform-2025.firebasestorage.app",
  messagingSenderId: "58743757512",
  appId: "1:58743757512:web:87f3bae3716901934e23fd",
  measurementId: "G-6TSW7DQ68J"
};

// 初始化 Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 資料庫集合名稱
export const COLLECTIONS = {
  VEHICLES: 'vehicles',
  USERS: 'users'
};

// 車輛狀態
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  PENDING: 'pending'
};

// 車輛類型
export const VEHICLE_TYPES = {
  TRUCK: 'truck',
  TRAILER: 'trailer',
  SEMI_TRAILER: 'semi-trailer'
};

// 車輛品牌（可根據實際需求增加）
export const VEHICLE_BRANDS = [
  'HINO', 'ISUZU', 'MITSUBISHI', 'NISSAN', 'TOYOTA',
  'SCANIA', 'VOLVO', 'MAN', 'MERCEDES-BENZ', 'DAF',
  'IVECO', 'FREIGHTLINER', 'PETERBILT', 'KENWORTH'
];