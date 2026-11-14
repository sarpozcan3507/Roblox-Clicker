ROBUX CLICKER X — BAŞLATMA SIRASI / TDZ DÜZELTMESİ

BU SÜRÜMDE DÜZELTİLENLER
1. MAX_PURCHASE_MULTIPLIER, MAX_ECONOMY_MULTIPLIER ve BALANCE_VERSION,
   GAME_RULES tanımlanır tanımlanmaz başlatılır.
2. createDefaultGameState() ve global state de ilk oyun doğrulamasından
   önce oluşturulur. Böylece erken callback'lerde
   "Cannot access 'MAX_PURCHASE_MULTIPLIER' before initialization" ve
   "Cannot access 'state' before initialization" hataları önlenir.
3. Oyun verisi ve ilerleme kuralları değiştirilmedi. Kayıt biçimi v5,
   bitiş hedefi 1 Tresvigintilyon (10^72) olarak korunur.
4. index.ts aynı çalışan Supabase Edge Function kaynağıdır. Bu düzeltme
   HTML istemcisinin başlatma sırasıyla ilgilidir; sunucu kuralları değişmedi.

DOSYA YERLEŞİMİ
- index.html -> Firebase Hosting'in public klasörüne (proje yapılandırmasına göre)
- index.ts -> yalnızca referans kopya
- supabase/functions/game-api/index.ts -> Supabase CLI'ın kullandığı gerçek dosya

KURULUM
1. ZIP içeriğini mevcut ~/Downloads/robux-clicker klasörüne çıkar.
2. ZIP içindeki index.html dosyasının firebase.json içindeki "public" dizininde
   bulunduğunu doğrula. Standart proje kökü kullanılıyorsa olduğu gibi bırak.
3. Proje klasöründe Hosting'i yayımla:

   cd ~/Downloads/robux-clicker && firebase deploy --project roblox-clicker07 --only hosting

ÖNEMLİ
- Bu düzeltme yalnızca istemci başlatma sırasını değiştiriyor. Supabase
  GAME_RULES ve fingerprint değişmediği için Edge Function'ı yeniden dağıtmak
  zorunlu değildir.
- Gerçek Supabase kaynak dosyası:
  supabase/functions/game-api/index.ts
- Dağıtım sonrası Safari'de Cmd+Shift+R ile sayfayı tamamen yenile.
- Oyun eski kayıtları açarken mevcut kaydı sıfırlamaz.
