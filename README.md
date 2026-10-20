# 💐 Web tặng bạn gái 20/10

Full stack: **Node.js + Express** (API, lưu lời nhắn vào file JSON) và frontend **HTML/CSS/JS thuần**.

## Chạy

```bash
npm install
npm start
# mở http://localhost:3000
```

## Cá nhân hóa (quan trọng!)

Sửa `data/config.json`:
- `herName`, `startDate` (ngày yêu nhau, định dạng YYYY-MM-DD)
- `reasons`, `timeline`, `letter`, `finalSurprise`
- `photos`: thay link ảnh Unsplash bằng ảnh thật của hai bạn. Bỏ ảnh vào `public/img/` rồi dùng `"src": "img/anh1.jpg"`.

## API

| Method | Route | Mô tả |
|---|---|---|
| GET | `/api/config` | Nội dung trang |
| GET | `/api/wishes` | Danh sách lời nhắn |
| POST | `/api/wishes` | Gửi lời nhắn `{message, mood}` |
| DELETE | `/api/wishes/:id` | Xóa lời nhắn |

## Deploy nhanh
Render / Railway / Fly.io đều chạy được (`npm start`). Lưu ý các nền tảng miễn phí có thể xóa file `data/wishes.json` khi restart.
