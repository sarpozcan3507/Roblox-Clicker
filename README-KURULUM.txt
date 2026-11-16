ROBUX CLICKER X — EŞLEŞEN DOSYA PAKETİ

Bu paket, aynı çalışan oyun sürümünden alınmış HTML ve Supabase Edge Function dosyalarını içerir.

İçerik:
- index.html
- index.ts
- supabase/functions/game-api/index.ts (index.ts ile birebir aynı dosya)

Kurulum:
1. ZIP dosyasını ~/Downloads/robux-clicker klasörüne çıkar.
2. Terminal'de proje klasörüne gir:
   cd ~/Downloads/robux-clicker
3. Dosyaların birebir aynı olduğunu kontrol et:
   cmp -s index.ts supabase/functions/game-api/index.ts && echo "Dosyalar eşleşiyor"
4. Supabase fonksiyonunu dağıt:
   supabase functions deploy game-api --project-ref pfzyxueduypesaqfwnrf --use-api --no-verify-jwt
5. Firebase sayfasını dağıt:
   firebase deploy --project roblox-clicker07 --only hosting
6. Safari'de Cmd+Shift+R yap.

Notlar:
- Oyun veri tabloları ve kayıt anahtarı değiştirilmedi.
- Yerel mod düğmesi tek bir tıklama işleyicisi kullanır.
- Bulut tıklamaları 120 ms içinde paketlenir; sunucu tarafındaki güvenlik sınırları değişmedi.
- ZIP içindeki kök index.ts ve supabase/functions/game-api/index.ts birebir aynıdır.
