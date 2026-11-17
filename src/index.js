export default {
  async fetch(request, env) {
    // CORS - ব্রাউজার থেকে কল করার জন্য
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Ghotimarket Notify Worker is Live ✅", {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      const data = await request.json();

      const productName = data.productName || "নাম নাই";
      const price = data.price || 0;
      const highRate = data.highRate || 0;
      const categoryId = data.categoryId || "-";
      const supplierEmail = data.supplierEmail || "-";
      const supplierUid = data.supplierUid || "-";
      const productId = data.productId || "-";
      const productDescription = data.productDescription || "";
      const freeDelivery = data.freeDelivery ? "হ্যাঁ ✅" : "না ❌";
      const image = data.images && data.images[0] ? data.images[0] : null;

      // Telegram Message
      const msg =
        `🔥 *নতুন প্রোডাক্ট আপলোড হইছে বস!*\n\n` +
        `📦 *নাম:* ${productName}\n` +
        `📝 *বিবরণ:* ${productDescription.slice(0, 200)}\n\n` +
        `💰 *পাইকারি দাম:* ${price}৳\n` +
        `📈 *হাই রেট:* ${highRate}৳\n` +
        `🚚 *ফ্রি ডেলিভারি:* ${freeDelivery}\n` +
        `📂 *Category ID:* \`${categoryId}\`\n\n` +
        `👤 *সাপ্লায়ার:* ${supplierEmail}\n` +
        `🆔 *Supplier UID:* \`${supplierUid}\`\n` +
        `🆔 *Product ID:* \`${productId}\`\n` +
        `🕒 *সময়:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Dhaka" })}`;

      // ১. ছবিসহ পাঠানোর চেষ্টা করবো, না হইলে শুধু টেক্সট
      let tgRes;
      if (image) {
        tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            photo: image,
            caption: msg,
            parse_mode: "Markdown",
          }),
        });
      }

      // ছবি ফেইল হইলে বা ছবি না থাকলে টেক্সট পাঠাও
      if (!image || !tgRes || !tgRes.ok) {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: msg,
            parse_mode: "Markdown",
          }),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
