# 等一個家｜手機 Demo 前端

香港貓狗領養資料專題的手機介面。功能包括滑卡探索、領養指南、動物檔案、照片與狀態時間線、中心地圖、統計圖、帳戶、收藏、分享和申請準備。

## 檔案位置

完整前端在 `static/`。`static/index.html` 是入口，`static/mobile.js` 負責頁面和 API 接駁，`static/insights.js` 包含地圖和圖表。

## 執行方式

透過《等一個家》的 FastAPI 服務提供此資料夾。讓 `/` 提供 `static/index.html`，並映射 `/static/`、`/manifest.webmanifest` 和 `/sw.js`。領養紀錄、帳戶和統計由同一來源的 `/api/` 提供，動物照片由 `/media/` 提供。運行完整 Demo 需要另行啟動 FastAPI、MongoDB 及照片目錄。
