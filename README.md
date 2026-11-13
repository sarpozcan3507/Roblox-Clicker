# 🎮 ROBUX CLICKER X — PET EVOLUTION

Robux Clicker X, Roblox tarzından ilham alan, evcil hayvanlar, yumurtalar, yükseltmeler ve rütbe sistemi içeren bir tıklama simülasyonu oyunudur.

Oyuncular tıklayarak para kazanır, yükseltmeler satın alır, pet koleksiyonlarını geliştirir ve daha yüksek rütbelere ulaşmaya çalışır.

🌐 **Canlı oyun:** https://roblox-clicker07.web.app  
📦 **GitHub:** https://github.com/sarpozcan3507/Roblox-Clicker

---

## ✨ Oyun Özellikleri

### 💰 Para ve Tıklama Sistemi
- Tıklayarak oyun parası kazanma
- Tıklama gücünü yükseltme
- Otomatik para kazanma
- Büyük sayılar için sayı biçimlendirme
- İlerlemeye dayalı ekonomi

### 🐾 Pet Sistemi
- Farklı pet türleri ve nadirlikler
- Pet koleksiyonu
- Pet güçleri ve çarpanları
- Üç aynı peti birleştirme (Fuse Machine)
- Genişletilebilir pet koleksiyonu

### 🥚 Yumurta Sistemi
- Yumurtalardan pet çıkarma
- Tekli veya toplu yumurta satın alma
- Özel miktar girme
- MAX satın alma seçeneği

### 🚀 Gelişim Sistemi
- Yükseltmeler
- Rütbe ilerlemesi
- Rebirth sistemi
- Kalıcı gelişim avantajları
- İlerledikçe artan oyun ekonomisi

### ☁️ Çevrimiçi Sistem
- Firebase Authentication ile hesap sistemi
- Supabase veritabanında oyuncu profilleri
- Sunucu tarafında doğrulanan oyun işlemleri
- Bulut üzerinden ilerleme kaydetme

---

## 🛠️ Kullanılan Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| HTML | Oyun arayüzü |
| CSS | Tasarım ve animasyonlar |
| JavaScript | Oyun mekanikleri |
| TypeScript | Sunucu tarafı oyun mantığı |
| Firebase Authentication | Kullanıcı girişi |
| Firebase Hosting | Web sitesi barındırma |
| Supabase PostgreSQL | Oyuncu verileri |
| Supabase Edge Functions | Güvenli oyun işlemleri |

---

## 📁 Proje Dosyaları

```text
Roblox-Clicker/
├── index.html
├── 404.html
├── firebase.json
├── firestore.rules
├── README.md
├── README-KURULUM.txt
└── supabase/
    ├── config.toml
    ├── functions/
    │   └── game-api/
    │       └── index.ts
    └── migrations/
        └── 20261109190000_create_game_profiles.sql
```

---

## 🔐 Güvenlik

- Oyuncu bakiyesi doğrudan tarayıcıdan veritabanına yazılmaz.
- Oyun işlemleri Supabase Edge Function üzerinden yürütülür.
- Firebase kullanıcı kimliği sunucu tarafında doğrulanır.
- Firestore tarayıcı erişimi kapalıdır.
- Supabase gizli anahtarları HTML dosyasına eklenmez.

---

## 🚀 Kurulum

Kurulum, veritabanı hazırlığı ve yayımlama adımları için:

**README-KURULUM.txt** dosyasını inceleyin.

---

## 📱 Mobil ve APK

Oyun web teknolojileriyle hazırlanmıştır ve mobil tarayıcılarla uyumludur.

Bir APK dönüştürücü kullanılarak Android uygulama paketi oluşturulabilir. Oyunun Firebase ve Supabase bağlantıları için internet erişimi gerekir.

Bu proje, Roblox Corporation'ın resmî oyunu değildir. Roblox markası ve ilgili varlıklar kendi sahiplerine aittir.

---

**Robux Clicker X — Pet Evolution**  
*Click • Collect • Upgrade • Evolve*
