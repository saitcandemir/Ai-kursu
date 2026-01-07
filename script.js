/* script.js */
const YavruZeka = {
    apiKey: localStorage.getItem('daily_api_key') || "",
    mufredat: [],
    sayac: parseInt(localStorage.getItem('soru_sayac')) || 0,

    async init() {
        // Güvenlik: Asiye Guard
        document.onkeydown = (e) => { if(e.keyCode == 123) return false; };
        
        // Müfredatı Yükle
        try {
            const res = await fetch('mufredat.json');
            const data = await res.json();
            this.mufredat = data.kurallar;
        } catch (e) { console.error("Müfredat yüklenemedi!"); }
    },

    async sor(soru) {
        const temizSoru = soru.toLowerCase();
        
        // 1. Önce Müfredat
        const sabit = this.mufredat.find(item => temizSoru.includes(item.soru));
        if (sabit) return sabit.cevap;

        // 2. Sonra Üye Verisi (Eğitim alanından gelen)
        const uyeVeri = localStorage.getItem('uye_egitim_verisi');
        if (uyeVeri && temizSoru.includes("bilgi")) return "İşletme Notu: " + uyeVeri;

        // 3. En son Global Zeka (20 Hak)
        if (this.sayac >= 20) return "Günlük 20 soruluk limitiniz doldu. Yeni anahtar isteyin.";
        if (!this.apiKey) return "Asistan şu an uykuda. Yönetici API anahtarı girmelidir.";

        return await this.fetchGemini(soru);
    },

    async fetchGemini(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({contents: [{parts: [{text: prompt}]}]})
        });
        const data = await response.json();
        this.sayac++;
        localStorage.setItem('soru_sayac', this.sayac);
        return data.candidates[0].content.parts[0].text;
    }
};

YavruZeka.init();