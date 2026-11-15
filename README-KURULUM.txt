 ROBUX CLICKER X — PERFORMANCE + SAVE-PROTECTION PATCH

Bu paket, Dosyaları Geliştir projesindeki eşleşen v5 dosya çiftinden hazırlanmıştır.
Oyun verileri, rütbeler, petler, yükseltmeler, Supabase API kuralları ve kayıt şeması değiştirilmedi.

Yapılan küçük düzeltmeler:
- Bulut tıklama kuyruğunun 1000 ms beklemesi 110 ms yapıldı. 3-4 hızlı dokunuş kısa bir pakette gönderilir.
- Sunucunun mevcut 30 tıklama/saniye sınırına uyulmaya devam edilir.
- Yerel ve bulut tıklama ekranı güncellemeleri requestAnimationFrame ile bir karede birleştirilir.
- Yerel kayıt için robuxClickerPro.backup.v1 yedeği eklenir. Ana kayıt boşsa daha önce oluşturulmuş dolu yedek geri okunur; boş durum mevcut ilerlemeyi ezemez.
- Eski anahtar robuxClickerPro aynen korunur.
- Başlık TRESVIGINTILLION ENDGAME olarak kalır.

KURULUM:
1) ZIP'i ~/Downloads/robux-clicker klasörüne çıkar.
2) Terminal'de:
   cd ~/Downloads/robux-clicker
   supabase functions deploy game-api --project-ref pfzyxueduypesaqfwnrf --use-api --no-verify-jwt
   firebase deploy --project roblox-clicker07 --only hosting
3) Safari'de Cmd+Shift+R yap.

ÖNEMLİ KAYIT NOTU:
Bu paket mevcut yerel kaydı silmez. Eğer önceki bozuk sürüm eski kaydın üzerine boş veri yazdıysa, tarayıcıda yedek bulunmaması durumunda kod tek başına silinmiş ilerlemeyi geri üretemez. Bulut ilerlemesi, Supabase game_profiles tablosunda duruyorsa aynı Firebase hesabıyla giriş yapıldığında doğru sunucu sürümü onu yeniden yükler. Hiçbir veritabanı/tablo sıfırlama işlemi yapma.
