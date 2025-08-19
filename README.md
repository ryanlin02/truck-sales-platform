# 大貨車銷售平台

專為大貨車業務人員打造的車輛分享與銷售平台，提供手機優先的使用體驗，讓業務同仁能夠輕鬆分享車輛資訊並促進銷售。

## 🚛 功能特色

### 核心功能
- **車輛展示** - 清晰的車輛列表與詳細資訊頁面
- **智能搜尋** - 支援品牌、類型、價格範圍等多條件篩選
- **圖片管理** - 支援多張圖片上傳，拖拽操作
- **用戶認證** - 安全的註冊登入系統
- **權限控制** - 僅能編輯自己發佈的車輛

### 使用者體驗
- **手機優先** - 針對直式螢幕優化設計
- **響應式** - 支援手機、平板、桌面裝置
- **極簡風格** - 白底黑字，簡潔易讀
- **快速載入** - 最精簡代碼架構

## 🛠 技術架構

### 前端技術
- **HTML5** - 語義化標籤
- **CSS3** - CSS變數統一管理外觀
- **Vanilla JavaScript** - 模組化 ES6+ 代碼
- **Firebase SDK** - 前端資料庫操作

### 後端服務
- **Firebase Authentication** - 用戶認證
- **Cloud Firestore** - NoSQL 資料庫
- **Firebase Storage** - 圖片儲存
- **Firebase Hosting** - 靜態網站託管

### 部署平台
- **GitHub Pages** - 代碼版本控制與部署
- **Firebase Hosting** - 主要託管平台

## 📁 專案結構

```
truck-sales-platform/
├── index.html              # 主頁面
├── vehicle-detail.html     # 車輛詳細頁面
├── add-vehicle.html        # 新增/編輯車輛頁面
├── my-vehicles.html        # 個人車輛管理頁面
├── css/
│   ├── global.css          # 全局CSS變數與基礎樣式
│   ├── main.css            # 主要組件樣式
│   └── mobile.css          # 手機優化樣式
├── js/
│   ├── config.js           # Firebase配置
│   ├── auth.js             # 身份驗證管理
│   ├── database.js         # 資料庫操作
│   ├── main.js             # 主頁面邏輯
│   └── utils.js            # 工具函數庫
├── icons/                  # 網站圖標
│   ├── icon-192.png
│   ├── icon-256.png
│   └── icon-512.png
├── firebase.json           # Firebase部署配置
├── firestore.rules         # Firestore安全規則
├── firestore.indexes.json  # Firestore索引配置
├── storage.rules           # Storage安全規則
└── README.md              # 專案說明文件
```

## 🚀 快速開始

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 專案名稱：`truck-sales-platform-2025`
4. 啟用以下服務：
   - Authentication (Email/Password)
   - Cloud Firestore
   - Storage
   - Hosting

### 2. 配置 Firebase

1. 在 Firebase Console 中，前往「專案設定」→「一般」
2. 在「您的應用程式」區段，選擇「網頁」
3. 複製 Firebase 配置物件
4. 將配置貼入 `js/config.js` 檔案中

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "truck-sales-platform-2025.firebaseapp.com",
  projectId: "truck-sales-platform-2025",
  storageBucket: "truck-sales-platform-2025.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 3. 設定 Firestore 規則

1. 在 Firebase Console 中，前往「Firestore Database」
2. 點擊「規則」標籤
3. 複製 `firestore.rules` 檔案內容並貼上
4. 點擊「發佈」

### 4. 設定 Storage 規則

1. 在 Firebase Console 中，前往「Storage」
2. 點擊「規則」標籤  
3. 複製 `storage.rules` 檔案內容並貼上
4. 點擊「發佈」

### 5. 建立 GitHub 儲存庫

1. 在 GitHub 建立新儲存庫：`truck-sales-platform`
2. 將專案檔案上傳到儲存庫
3. 啟用 GitHub Pages（可選）

### 6. 部署到 Firebase

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案
firebase init

# 部署
firebase deploy
```

## 📱 使用說明

### 業務人員註冊
1. 開啟網站首頁
2. 點擊「登入」按鈕
3. 選擇「立即註冊」
4. 填寫姓名、電子郵件、密碼、公司名稱
5. 完成註冊後自動登入

### 新增車輛
1. 登入後點擊「新增車輛」按鈕
2. 填寫車輛基本資訊（品牌、車型、年份、價格）
3. 填寫車輛規格（引擎、變速箱、載重量等）
4. 上傳車輛照片（支援拖拽，最多10張）
5. 撰寫車輛描述
6. 填寫聯絡方式
7. 點擊「發佈車輛」

### 管理車輛
1. 點擊「我的車輛」檢視已發佈的車輛
2. 可以編輯、標記售出、或刪除車輛
3. 查看銷售統計

### 搜尋車輛
1. 在首頁使用搜尋框輸入關鍵字
2. 使用篩選條件（品牌、類型、價格範圍）
3. 點擊車輛卡片查看詳細資訊

## 🔒 安全性

### 資料安全
- Firebase Authentication 提供安全的用戶認證
- Firestore Security Rules 確保資料存取權限
- Storage Rules 限制圖片上傳權限

### 隱私保護
- 僅顯示業務人員提供的聯絡方式
- 用戶只能編輯自己的車輛資訊
- 圖片儲存在 Firebase Storage 安全環境

## 🎨 設計原則

### 外觀設計
- **極簡主義** - 白底黑字，最少視覺干擾
- **一致性** - CSS變數統一管理顏色、間距、字型
- **易讀性** - 清晰的層級結構與對比度

### 用戶體驗
- **手機優先** - 針對直式螢幕操作優化
- **快速回饋** - 載入狀態與操作回饋
- **直觀操作** - 符合用戶習慣的互動模式

## 🔧 維護與擴展

### 新增功能
- 修改 `js/config.js` 添加新的常數
- 在對應的 HTML 檔案中添加 UI 元素
- 在相關的 JS 檔案中實作功能邏輯
- 更新 CSS 樣式檔案

### 樣式調整
- 修改 `css/global.css` 中的 CSS 變數
- 所有頁面會自動套用新的設計風格

### 資料庫變更
- 更新 `firestore.rules` 安全規則
- 修改 `firestore.indexes.json` 索引配置
- 在 Firebase Console 中重新部署規則

## 📈 效能優化

### 載入優化
- 使用 Firebase CDN 提供的 SDK
- CSS 與 JS 檔案分離，避免重複載入
- 圖片延遲載入與壓縮

### 快取策略
- Firebase Hosting 提供自動 CDN 快取
- 靜態資源設定長期快取
- HTML 檔案設定短期快取

## 🆘 疑難排解

### 常見問題

**問題：無法登入**
- 確認 Firebase Authentication 已啟用
- 檢查網路連接
- 確認電子郵件和密碼正確

**問題：圖片上傳失敗**
- 確認圖片格式為 JPG、PNG 或 WebP
- 檢查圖片大小是否超過 5MB
- 確認 Storage 規則已正確設定

**問題：車輛資料無法載入**
- 確認 Firestore 規則已正確設定
- 檢查瀏覽器控制台錯誤訊息
- 確認網路連接正常

### 技術支援
如遇到技術問題，請檢查瀏覽器控制台的錯誤訊息，並確認 Firebase 服務狀態。

## 📄 授權條款

本專案僅供內部業務使用，請勿用於商業目的。所有車輛資訊版權歸發佈者所有。

---

**版本：** 1.0.0  
**最後更新：** 2025年8月19日  
**開發者：** Claude AI 🤖