# 等一個家｜手機 Demo

香港貓狗領養資料專題的手機 Demo。可以滑卡探索、查閱領養指南、看中心地圖和統計，並從動物檔案追查照片、原始來源與兩期領養狀態。也可在本機註冊測試帳戶、收藏、分享和完成申請清單。

手機以全螢幕呈現，桌面以手機外框預覽。點選地圖上的中心可進入該中心的完整名單，再按年齡篩選。探索頁也支援動物名字、地區或機構搜尋及復原略過。數據頁的「生命流向」可直接打開 VERITY 的原始紀錄，「資料解讀」說明兩期快照的涵蓋範圍。

在「數據 → 等待」可以按年齡組查看有起算依據的檔案。點選紅點可閱讀該動物的故事，再開啟照片、狀態紀錄及機構原文。圖中列出每個個案的日期依據。只有月份的紀錄以估算範圍顯示。獲救至快照的時間可能包含醫療和暫養期。動物檔案預設顯示已收錄的機構介紹和記錄日期。支援更新的機構會另有按鈕，可查閱官網目前的文字。

## 啟動完整 Demo

1. 複製或下載此倉庫。從 [GitHub Release](https://github.com/Calm404Wind/waiting-for-home-mobile/releases/tag/demo-2026-11-23) 下載 `photos-01.zip` 至 `photos-06.zip`，放到專案根目錄的 `photo-packs/`。
2. 在專案根目錄執行以下指令。照片還原需要 Python 3.11 或以上，服務由 Docker Compose 啟動。

   ```sh
   python tools/install_photos.py
   docker compose up --build
   ```

3. 開啟 [手機 Demo](http://127.0.0.1:8047/)。首頁的 Verity 個案可查看 10 月 20 日待領養、11 月 23 日已領養的兩次觀察。數據頁可查看中心地圖和各中心的來源。

Compose 會啟動 MongoDB、匯入隨倉庫附上的兩期目錄，再啟動 FastAPI。照片程式會驗證每個壓縮檔的 SHA-256，並把檔案放到 `archive/`。只想核對資料與互動邏輯時，可先啟動 Compose，動物照片會在還原後供應。

中心地圖預設以 OpenStreetMap 顯示街道、地名和領養中心，支援拖動、縮放、全螢幕及切換香港地政總署航拍底圖。選取中心後，可以查看領養名單，或用「附近街景」在 Google Maps 開啟該座標。上述操作均無需 API 金鑰。街道底圖無法載入時，畫面會提示並顯示行政區示意圖，按「重試街道圖」可重新載入。

若要使用 AI Studio 版的 Google 街道圖、衛星圖與街景控制，在專案根目錄的 `.env` 設定 `ADOPTION_GOOGLE_MAPS_BROWSER_KEY`，再執行 `docker compose up -d`。從 AI Studio 匯入時也可沿用 `VITE_GOOGLE_MAPS_API_KEY`。兩者都有值時，優先使用 `ADOPTION_GOOGLE_MAPS_BROWSER_KEY`。請使用限定網站和 Maps JavaScript API 的瀏覽器金鑰。

若本機已有可用的 MongoDB，也可直接啟動 Python 服務。

```sh
python -m pip install -r requirements.txt
python tools/restore_catalogue.py
python -m backend
```

Python 服務預設使用 `mongodb://127.0.0.1:27017`，也可透過 `ADOPTION_MONGO_URI` 設定資料庫連線。測試帳戶在新環境建立。

## 原始碼和資料

| 位置 | 內容 |
|---|---|
| `static/` | 完整手機前端，入口為 `index.html` |
| `backend/` | FastAPI、帳戶、領養名錄、統計與地圖 API |
| `data/catalogue.mongodb.zip` | 2026 年 10 月 20 日及 11 月 23 日領養資料，含 4,681 則刊登、6,302 筆觀察、14 個中心和 19,093 筆媒體關聯 |
| `backend/data/stories.json.gz` | 依快照日期、機構原文網址及動物檔案比對的官網故事，供動物檔案和等待圖查證來源 |
| `data/photos-manifest.json` | 原始照片的檔案路徑、完整性校驗及分包對照 |

本機服務同時提供前端與 `/api/`、`/media/`。要讓組員直接用網址操作，可將 FastAPI、資料庫和照片部署到可連線的環境。
