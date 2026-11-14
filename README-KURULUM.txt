ROBUX CLICKER X — YEREL MOD + BULUT HATA AYRINTISI DÜZELTMESİ

PAKET İÇERİĞİ
- index.html
- index.ts (referans kopya)
- supabase/functions/game-api/index.ts (Supabase CLI'ın dağıtacağı asıl dosya)

DÜZELTMELER
1. Yerel durum oluşturucu defaultState sabitinden, hoist edilen
   createDefaultGameState() fonksiyonuna taşındı. Böylece başlatma sırası
   kaynaklı `Cannot access 'defaultState' before initialization` hatası
   ortadan kaldırıldı.
2. Bulut girişinde hata aşaması ayrıştırılıyor: Firebase giriş mi, Supabase
   profil yükleme mi başarısız oldu, ekranda yazıyor.
3. Bilinmeyen Firebase hataları artık genel bir uyarıya çevrilmiyor; gerçek
   hata kodu ve ayrıntısı gösteriliyor.
4. Supabase ağ/CORS/DNS hataları, HTTP durum kodu ve sunucu hata kodu görünür.
5. Safari SESSION depolamasını engelliyorsa giriş NONE (geçici oturum) ile
   tekrar deneniyor.
6. Oyun hedefi 1 Tresvigintilyon (10^72) olarak korunmuştur.
7. Oyun veri sözleşmesi değişmediği için rulesVersion v5 olarak korunmuştur.

KURULUM (Mac)
1. ZIP'i indir.
2. Terminal'de şu komutu çalıştırarak dosyaları mevcut projenin üzerine çıkar:

unzip -o ~/Downloads/robux-clicker-v8-fix.zip -d ~/Downloads/robux-clicker

3. Ardından dağıt:

cd ~/Downloads/robux-clicker && test -s index.html && test -s supabase/functions/game-api/index.ts && supabase functions deploy game-api --project-ref pfzyxueduypesaqfwnrf --use-api --no-verify-jwt && firebase deploy --project roblox-clicker07 --only hosting

4. Dağıtım tamamlandıktan sonra Safari'de Cmd+Shift+R yap.

ÖNEMLİ
- Bu paket dosyaları hazırlar; hesaplarına kendiliğinden dağıtım yapmaz.
- Kök dizindeki index.ts kopyadır. Supabase CLI'ın asıl kaynağı
  supabase/functions/game-api/index.ts dosyasıdır.
- Bulut modu hâlâ başarısız olursa giriş ekranındaki hata aşamasını, hata
  kodunu ve ayrıntıyı aynen paylaş. Artık gerçek Firebase/Supabase sebebi
  gizlenmeden görülecektir.
