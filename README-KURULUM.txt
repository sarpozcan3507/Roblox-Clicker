ROBUX CLICKER X — KURULUM VE YAYIMLAMA REHBERİ
==================================================

PROJE
-----
GitHub:
https://github.com/sarpozcan3507/Roblox-Clicker

Firebase Hosting:
https://roblox-clicker07.web.app

Firebase proje kimliği:
roblox-clicker07

Supabase proje kimliği:
pfzyxueduypesaqfwnrf


1. PROJE DOSYALARINI HAZIRLAMA
------------------------------
GitHub deposunu ZIP olarak indir.

ZIP dosyasını bilgisayarına çıkar.

Ana proje klasöründe aşağıdaki dosyaların bulunduğundan emin ol:

- index.html
- firebase.json
- firestore.rules
- 404.html
- supabase/config.toml
- supabase/functions/game-api/index.ts
- supabase/migrations/20261109190000_create_game_profiles.sql

Önemli:
supabase klasörünün tamamı korunmalıdır.
Edge Function ve SQL migration dosyaları gereklidir.


2. SUPABASE VERİTABANI KURULUMU
-------------------------------
Aşağıdaki adresi aç:

https://supabase.com/dashboard/project/pfzyxueduypesaqfwnrf/sql/new

SQL Editor bölümüne gir.

Şu dosyayı aç:

supabase/migrations/20261109190000_create_game_profiles.sql

Dosyanın TAMAMINI SQL Editor alanına kopyala.

RUN düğmesine bas.

Bu işlem oyuncu profillerinin saklanacağı tabloyu oluşturur.

Not:
Bu SQL işlemi mevcut tabloyu silmek için tasarlanmamıştır.


3. SUPABASE CLI KURULUMU
------------------------
Mac üzerinde Terminal'i aç.

Supabase CLI henüz kurulu değilse:

brew install supabase/tap/supabase

Kurulumdan sonra:

supabase --version


4. SUPABASE HESABINA GİRİŞ
--------------------------
Terminal'de proje klasörüne geç.

Örneğin:

cd ~/Downloads/Roblox-Clicker

Supabase hesabına giriş yap:

supabase login

Ardından projeyi bağla:

supabase link --project-ref pfzyxueduypesaqfwnrf

Giriş sırasında istenen kişisel erişim tokenini kimseyle paylaşma.


5. EDGE FUNCTION YAYIMLAMA
--------------------------
Ana proje klasöründe şu komutu çalıştır:

supabase functions deploy game-api --use-api

Bu işlem oyun sunucusunun oyun işlemlerini doğrulamasını ve oyuncu profillerini yönetmesini sağlar.

Önemli:
Supabase Edge Function için gerekli sunucu gizli anahtarları Supabase ortamında bulunmalıdır.
Service Role / Secret anahtarını index.html dosyasına koyma.


6. FIREBASE CLI KURULUMU
------------------------
Node.js kurulu olmalıdır.

Firebase CLI henüz kurulu değilse:

npm install -g firebase-tools

Sürüm kontrolü:

firebase --version


7. FIREBASE HESABINA GİRİŞ
--------------------------
Terminal'de:

firebase login

Tarayıcıda Firebase hesabınla giriş yap.


8. FIREBASE AUTH AYARLARI
-------------------------
Firebase Console adresini aç:

https://console.firebase.google.com/project/roblox-clicker07/authentication

Authentication bölümüne gir.

Sign-in method bölümünde:

Email/Password

giriş yöntemini etkinleştir.

Authorized domains bölümünde şu adresin bulunduğundan emin ol:

roblox-clicker07.web.app


9. FIREBASE HOSTING YAYIMLAMA
-----------------------------
Ana proje klasöründe şu komutu çalıştır:

firebase deploy --project roblox-clicker07 --only hosting,firestore:rules

Yayımlama tamamlandığında oyunu aç:

https://roblox-clicker07.web.app


10. OYUN TESTLERİ
-----------------
Yayımlama sonrasında şu kontrolleri yap:

[ ] Oyun sayfası açılıyor.
[ ] Hesap oluşturulabiliyor.
[ ] Hesaba giriş yapılabiliyor.
[ ] Oyuncu profili oluşturuluyor.
[ ] Tıklama sistemi çalışıyor.
[ ] Para kazanılıyor.
[ ] Yükseltme satın alınabiliyor.
[ ] Yumurta satın alınabiliyor.
[ ] Pet sistemi çalışıyor.
[ ] Fuse Machine çalışıyor.
[ ] Rebirth ve rütbe sistemi çalışıyor.
[ ] Sayfa yenilendiğinde bulut ilerlemesi korunuyor.


11. APK OLUŞTURMA
-----------------
Oyun Android APK olarak paketlenecekse:

- Web tabanlı APK dönüştürücü kullan.
- index.html dosyasının ve gerekli oyun dosyalarının pakette bulunduğundan emin ol.
- Uygulamanın internet erişimine izin ver.
- Gereksiz Android izinlerini etkinleştirme.

Gerekli temel izin:

INTERNET

Kamera, mikrofon, GPS, NFC ve telefon durumu izinleri oyunun temel çalışması için gerekli değildir.

APK oluşturulması, oyunun otomatik olarak çevrimdışı çalışacağı anlamına gelmez.
Firebase ve Supabase özellikleri için internet bağlantısı gerekir.


12. GÜVENLİK VE ÖNEMLİ NOTLAR
-----------------------------
- Firebase Authentication kullanıcı girişlerini yönetir.
- Supabase oyuncu profillerini saklar.
- Oyun işlemleri Edge Function üzerinden yürütülür.
- Firestore tarayıcı okuma ve yazma erişimi kapalıdır.
- Secret ve Service Role anahtarları herkese açık dosyalara eklenmemelidir.
- Hiçbir çevrimiçi oyun sistemi tüm hileleri yüzde yüz engelleyemez.
- Supabase Free planının kullanım limitleri vardır.

ESKİ KAYITLAR:
Eski Firestore kayıtları otomatik olarak Supabase'e taşınmaz.
Eski kayıtların güvenli biçimde taşınması için ayrıca bir aktarım sistemi gerekir.

DAĞITIM DURUMU:
SQL migration ve Edge Function dosyalarının depoda bulunması, bunların canlı Supabase projesine otomatik olarak dağıtıldığı anlamına gelmez.
Canlı sistemin çalışması için yukarıdaki kurulum ve test adımları tamamlanmalıdır.


TAMAMLANDI
----------
Robux Clicker X — Pet Evolution

GitHub:
https://github.com/sarpozcan3507/Roblox-Clicker

Oyun:
https://roblox-clicker07.web.app
