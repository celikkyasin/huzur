const { escapeHtml, getNamesOfAllahConfig, handleCors, html, isAdminRequest } = require("../_lib/namesOfAllahStore");

function renderProtected(response, token) {
  html(
    response,
    401,
    `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Huzur Admin - 99 İsim Görselleri</title>
  <style>
    body{margin:0;background:#f7f0e4;color:#101815;font-family:Arial,sans-serif}
    main{max-width:980px;margin:0 auto;padding:44px 20px}
    h1{font-size:44px;margin:0 0 20px}
    .box{background:#fffaf1;border:1px solid #ded0b8;border-radius:8px;padding:22px;line-height:1.7}
    code{background:#efe4d1;border-radius:6px;padding:8px 10px}
  </style>
</head>
<body>
  <main>
    <strong>HUZUR ADMIN</strong>
    <h1>99 İsim görselleri</h1>
    <div class="box">
      <h2>Bu alan korumalı.</h2>
      <p>Sayfayı admin token ile açman gerekiyor:</p>
      <p><code>/names-of-allah/admin?token=${escapeHtml(token || "SENIN_ADMIN_SIFREN")}</code></p>
    </div>
  </main>
</body>
</html>`
  );
}

function renderAdmin(response, token, config) {
  const imagesJson = JSON.stringify(config.images || []).replace(/</g, "\\u003c");

  html(
    response,
    200,
    `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Huzur Admin - 99 İsim Görselleri</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f7f0e4;color:#101815;font-family:Arial,sans-serif}
    main{max-width:1120px;margin:0 auto;padding:42px 20px}
    .top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}
    strong{color:#007965;letter-spacing:2px}
    h1{font-size:46px;line-height:1;margin:8px 0 0}
    .actions{display:flex;gap:10px}
    button{height:42px;border-radius:8px;border:1px solid #d8c7aa;background:#fffaf1;color:#007965;font-weight:900;padding:0 16px;cursor:pointer}
    button.primary{background:#007965;color:white;border-color:#007965}
    .panel{background:#fffaf1;border:1px solid #ded0b8;border-radius:8px;box-shadow:0 24px 70px rgba(77,55,24,.12);overflow:hidden}
    .hint{padding:18px 20px;border-bottom:1px solid #ded0b8;color:#6d6254;font-weight:800}
    .form{display:grid;grid-template-columns:120px 1fr 1fr;gap:14px;padding:18px 20px;border-bottom:1px solid #ded0b8}
    label{display:block;color:#6d6254;font-size:13px;font-weight:900;margin-bottom:7px}
    input,select{width:100%;height:44px;border:1px solid #d8c7aa;border-radius:8px;background:#fff;padding:0 12px;font-weight:800}
    .wide{grid-column:1/-1}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;padding:20px}
    .card{border:1px solid #ded0b8;border-radius:8px;background:#fff;overflow:hidden}
    .thumb{aspect-ratio:9/16;background:#eadfc9;display:flex;align-items:center;justify-content:center;color:#7a6a55;font-weight:900;text-align:center;padding:12px}
    .thumb img{width:100%;height:100%;object-fit:cover}
    .meta{padding:10px;font-size:13px}
    .meta b{display:block;font-size:15px;margin-bottom:4px}
    .status{margin-top:14px;color:#007965;font-weight:900}
    @media(max-width:760px){.top{display:block}.actions{margin-top:16px}.form{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <div class="top">
      <div>
        <strong>HUZUR ADMIN</strong>
        <h1>99 İsim görselleri</h1>
      </div>
      <div class="actions">
        <button onclick="location.href='/names-of-allah/config'">JSON</button>
        <button class="primary" onclick="saveImage()">Kaydet</button>
      </div>
    </div>
    <div class="panel">
      <div class="hint">1080x1920 premium PNG/JPG yükle. Uygulama açıldığında bu gerçek görselleri gösterir; kodla çizilmiş kart kullanılmaz.</div>
      <div class="form">
        <input type="hidden" id="admin-token" value="${escapeHtml(token)}" />
        <div>
          <label>Sıra</label>
          <select id="order"></select>
        </div>
        <div>
          <label>Okunuş</label>
          <input id="transliteration" placeholder="Er-Rahman" />
        </div>
        <div>
          <label>Görsel oranı</label>
          <select id="aspectRatio">
            <option value="0.5625">1080x1920 dikey</option>
            <option value="1">1080x1080 kare</option>
          </select>
        </div>
        <div class="wide">
          <label>Görsel linki</label>
          <input id="imageUrl" placeholder="https://..." />
        </div>
        <div class="wide">
          <label>Dosya yükle</label>
          <input id="file" type="file" accept="image/png,image/jpeg,image/webp" />
        </div>
      </div>
      <div class="grid" id="grid"></div>
    </div>
    <div class="status" id="status"></div>
  </main>
  <script>
    const existing = ${imagesJson};
    const token = document.getElementById("admin-token").value;
    const orderSelect = document.getElementById("order");
    const statusEl = document.getElementById("status");
    for (let i = 1; i <= 99; i += 1) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = String(i).padStart(2, "0");
      orderSelect.appendChild(option);
    }

    function setStatus(text) {
      statusEl.textContent = text;
    }

    function render() {
      const byOrder = new Map(existing.map((item) => [Number(item.order), item]));
      const grid = document.getElementById("grid");
      grid.innerHTML = "";
      for (let i = 1; i <= 99; i += 1) {
        const item = byOrder.get(i);
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML =
          '<div class="thumb">' + (item?.imageUrl ? '<img src="' + item.imageUrl + '" alt="">' : 'Görsel yok') + '</div>' +
          '<div class="meta"><b>' + String(i).padStart(2, "0") + '</b>' + (item?.transliteration || "") + '</div>';
        card.onclick = () => {
          orderSelect.value = String(i);
          document.getElementById("transliteration").value = item?.transliteration || "";
          document.getElementById("imageUrl").value = item?.imageUrl || "";
          document.getElementById("aspectRatio").value = String(item?.aspectRatio || 0.5625);
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
        grid.appendChild(card);
      }
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    async function uploadFileIfNeeded(order) {
      const file = document.getElementById("file").files[0];
      if (!file) return document.getElementById("imageUrl").value.trim();
      setStatus("Görsel yükleniyor...");
      const imageData = await readFileAsDataUrl(file);
      const response = await fetch("/names-of-allah/upload?token=" + encodeURIComponent(token), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, fileName: file.name, imageData })
      });
      const body = await response.json();
      if (!response.ok || !body.url) throw new Error(body.error || "Upload failed");
      return body.url;
    }

    async function saveImage() {
      try {
        const order = Number(orderSelect.value);
        const imageUrl = await uploadFileIfNeeded(order);
        if (!imageUrl) {
          setStatus("Görsel linki veya dosya gerekli.");
          return;
        }
        const item = {
          id: "name-" + order,
          order,
          transliteration: document.getElementById("transliteration").value.trim(),
          imageUrl,
          aspectRatio: Number(document.getElementById("aspectRatio").value)
        };
        setStatus("Kaydediliyor...");
        const response = await fetch("/names-of-allah/config?token=" + encodeURIComponent(token), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: [item] })
        });
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error(body.error || "Save failed");
        const index = existing.findIndex((entry) => Number(entry.order) === order);
        if (index >= 0) existing[index] = item; else existing.push(item);
        render();
        document.getElementById("file").value = "";
        setStatus("Kaydedildi. Uygulama açıldığında güncel görseli alır.");
      } catch (error) {
        setStatus("Kaydedilemedi: " + (error.message || "Bilinmeyen hata"));
      }
    }

    render();
  </script>
</body>
</html>`
  );
}

module.exports = async function handler(request, response) {
  if (handleCors(request, response)) {
    return;
  }

  if (!isAdminRequest(request)) {
    renderProtected(response, request.query?.token || "");
    return;
  }

  try {
    const config = await getNamesOfAllahConfig();
    renderAdmin(response, request.query?.token || request.headers["x-admin-token"], config);
  } catch (error) {
    html(response, 500, `Admin yüklenemedi: ${escapeHtml(error instanceof Error ? error.message : "Bilinmeyen hata")}`);
  }
};
