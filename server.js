const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/stats', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Thiếu URL TikTok' });
  }

  try {
    // Tạo URL TikWM API
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;

    // Gọi TikWM với header giả lập
    const response = await axios.get(apiUrl, {
      headers: {
        // giả lập trình duyệt Chrome/Mac để TikWM không block
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        // thêm Referer về tikwm.com
        'Referer': 'https://tikwm.com/'
      },
      timeout: 10000, // timeout 10 giây
    });

    // Nếu TikWM trả về không đúng format => lỗi
    if (!response.data || response.data.code !== 0 || !response.data.data) {
      throw new Error('TikWM trả về dữ liệu không hợp lệ');
    }

    const stats = response.data.data;

    // Trả về chỉ các trường cần thiết
    return res.json({
      views: stats.play_count,
      likes: stats.like_count,
      comments: stats.comment_count,
      shares: stats.share_count
    });
  } catch (err) {
    // Bắt lỗi và trả về JSON lỗi
    return res.status(500).json({
      error: 'Không thể lấy dữ liệu từ TikWM',
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
