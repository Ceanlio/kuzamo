# Kuzamo - AI Destekli İçerik Planlama Platformu

Kuzamo, küçük ekipler için AI destekli içerik planlama ve yayınlama iş akışı sunar. Blog, sosyal medya ve e-postalarınızı tek yerden yönetin.

## 🌟 Özellikler

- 🤖 AI destekli içerik üretimi
- 📅 Akıllı planlama takvimi
- 🚀 Çoklu platform yayınlama
- 👥 Ekip işbirliği
- 📊 Detaylı analitik
- 🌍 Türkçe/İngilizce dil desteği
- 🌙/☀️ Karanlık/Aydınlık tema

## 🚀 Deployment

### Cloudflare Pages'e Deploy Etme

1. **Wrangler CLI Kurulumu:**
   ```bash
   npm install -g wrangler
   ```

2. **Cloudflare'e Giriş:**
   ```bash
   wrangler login
   ```

3. **Otomatik Deploy:**
   ```bash
   ./deploy.sh
   ```

4. **Manuel Deploy:**
   ```bash
   # Main branch (production)
   wrangler pages deploy . --project-name kuzamo-pages --branch main
   
   # Production branch (preview)
   wrangler pages deploy . --project-name kuzamo-pages --branch production
   ```

### Deployment URL'leri

- **Production:** https://kuzamo.com
- **Preview:** https://production.kuzamo-pages.pages.dev
- **Project:** https://kuzamo-pages.pages.dev

## 📁 Proje Yapısı

```
ku final/
├── index.html          # Ana sayfa
├── about.html          # Hakkımızda
├── pricing.html        # Fiyatlandırma
├── faq.html           # SSS
├── contact.html        # İletişim
├── privacy.html        # Gizlilik Politikası
├── terms.html          # Kullanım Şartları
├── languages.json      # Dil çevirileri
├── deploy.sh           # Deployment script'i
└── README.md           # Bu dosya
```

## 🌍 Dil Desteği

- **Türkçe (TR):** Varsayılan dil
- **İngilizce (EN):** Tarayıcı dili otomatik algılanır
- **Manuel Değiştirme:** Navbar'daki TR/EN butonu ile

## 🎨 Tema

- **Otomatik:** Tarayıcı tercihine göre
- **Manuel:** Navbar'daki 🌙/☀️ butonu ile
- **Local Storage:** Kullanıcı tercihi kaydedilir

## 🔧 Geliştirme

### Yerel Test
```bash
# Python HTTP server ile
python3 -m http.server 8000

# Node.js ile
npx serve .
```

### Dosya Değişiklikleri
1. HTML dosyalarını düzenleyin
2. `./deploy.sh` script'ini çalıştırın
3. Değişiklikler otomatik olarak Cloudflare Pages'e yüklenir

## 📊 Deployment Durumu

Deployment durumunu kontrol etmek için:
```bash
wrangler pages deployment list --project-name kuzamo-pages
```

## 🌐 Domain Yönetimi

- **Ana Domain:** kuzamo.com
- **Subdomain:** kuzamo-pages.pages.dev
- **SSL:** Otomatik olarak Cloudflare tarafından sağlanır

## 📞 İletişim

- **E-posta:** hello@kuzamo.com
- **Website:** https://kuzamo.com

---

© 2025 Kuzamo. Tüm hakları saklıdır.
