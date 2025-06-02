const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/stats', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'Thiếu URL TikTok' });

  try {
    // Gọi TikWM API để lấy dữ liệu tương tác
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);

    if (response.data.code !== 0 || !response.data.data) {
      throw new Error('Không lấy được dữ liệu từ TikWM');
    }

    const stats = response.data.data;

    res.json({
      views: stats.play_count,
      likes: stats.like_count,
      comments: stats.comment_count,
      shares: stats.share_count
    });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy dữ liệu từ TikWM', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
