const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002; // Chạy trên cổng 3002

app.use(express.json());

let totalExecute = 0;
let dk2Servers = new Map(); 

function getSeaName(placeId) {
    const id = String(placeId);
    if (id === "7449423635") return "Dough King V2 Sea 3";
    return `Dough King V2 (Place: ${id})`;
}

app.post('/update-dk2', (req, res) => {
    console.log("➡️ [Web] Nhận yêu cầu POST từ Roblox:", req.body);

    const { jobid, players, placeId } = req.body;
    
    if (!jobid) {
        console.log("❌ [Lỗi Web] Từ chối do thiếu JobId");
        return res.status(400).send("Thiếu JobId");
    }

    // 🔒 BỘ LỌC SEA 3 CHẶT CHẼ
    if (String(placeId) !== "7449423635") {
        console.log(`❌ [Lỗi Web] Từ chối Server vì không phải Sea 3 (Place ID nhận được: ${placeId})`);
        return res.status(403).send("Chỉ nhận dữ liệu từ Sea 3");
    }

    totalExecute++; 

    dk2Servers.set(jobid, {
        "placeId": Number(placeId) || 0,
        "jobId": jobid,
        "players": Number(players) || 1,
        "name": getSeaName(placeId),
        "updatedAt": Date.now()
    });

    console.log(`✅ [Web] Đã nạp thành công Server Dough King V2! JobId: ${jobid} | Sea: ${placeId}`);
    res.status(200).send("Cập nhật thành công Server!");
});

app.get('/api', (req, res) => {
    const dk2DataArray = Array.from(dk2Servers.values());
    res.json(dk2DataArray);
});

setInterval(() => {
    const now = Date.now();
    for (let [jobid, data] of dk2Servers.entries()) {
        if (now - data.updatedAt > 15 * 60 * 1000) { 
            console.log(`🧹 [Web] Hết thời gian, xóa Server cũ: ${jobid}`);
            dk2Servers.delete(jobid);
        }
    }
}, 60000); 

app.get('/', (req, res) => {
    const dk2DataArray = Array.from(dk2Servers.values());
    
    const finalData = {
        "Total Execute": totalExecute,
        "by": "tranduykhanh",
        "sea_filter": "Only Sea 3",
        "total_dk2_servers": dk2DataArray.length,
        "dk2_data": dk2DataArray
    };

    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dough King V2 Tracker - Sea 3</title>
        <style>
            body { background-color: #121212; color: #e0e0e0; font-family: monospace; padding: 15px; margin: 0; }
            .controls { margin-bottom: 10px; font-size: 14px; user-select: none; }
            pre { background-color: #181818; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; margin: 0; }
        </style>
    </head>
    <body>
        <div class="controls"><label><input type="checkbox" id="prettyPrint" checked onchange="renderJSON()"> Tạo bản in đẹp</label></div>
        <pre id="jsonContent"></pre>
        <script>
            const rawData = ${JSON.stringify(finalData)};
            function renderJSON() {
                const isPretty = document.getElementById('prettyPrint').checked;
                const container = document.getElementById('jsonContent');
                if (isPretty) { container.textContent = JSON.stringify(rawData, null, 2); } else { container.textContent = JSON.stringify(rawData); }
            }
            renderJSON();
            setTimeout(() => { location.reload(); }, 8000);
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Web đang chạy tại port ${PORT} - Nhận dữ liệu Dough King V2 (Chỉ Sea 3)`);
});
      
