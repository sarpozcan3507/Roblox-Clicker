ROBUX CLICKER — ÜCRETSİZ SUPABASE SUNUCU KURULUMU

BU PAKETTE
- index.html: Firebase Authentication ile giriş yapar; oyun işlemlerini Supabase Edge Function üzerinden yürütür.
- firebase.json: Firebase Hosting yapılandırması.
- firestore.rules: Firestore tarayıcı erişimini kapatır; oyun ilerlemesi Supabase'te tutulur.
- 404.html: mevcut dosyanız, değiştirilmedi.
- supabase/: Edge Function, SQL migration ve proje ayarı.

ÖNEMLİ VERİ NOTU
Eski Firestore kayıtları otomatik taşınmaz. Eski istemci yazılabilir bakiyeler güvenilir biçimde doğrulanamadığından, güvenli Supabase profilinin ilk açılışında oyuncu sıfır bakiyeyle başlar. Eski ilerlemeni kaybetmek istemiyorsan dağıtımdan önce yedek al; ancak eski yedekleri bulut bakiyesine içe aktarmak güvenlik açığı oluşturur.

1) DOSYALARI YERLEŞTİR
ZIP içeriğini mevcut robux-clicker klasörüne çıkar ve bu paketteki index.html, firebase.json, firestore.rules dosyalarının eskilerin yerine geçmesine izin ver. 404.html dosyan korunur. supabase klasörünün tamamını aynı ana klasöre koy. Firebase Cloud Functions kullanılmıyor; eski functions/ klasörünü dağıtma. Bu ücretsiz kurulumda Firebase functions/package.json dosyaları gerekli değil.

2) SUPABASE VERİTABANINI HAZIRLA (BİR KEZ)
Şu sayfayı aç: https://supabase.com/dashboard/project/pfzyxueduypesaqfwnrf/sql/new
Bu paketteki şu dosyanın TAMAMINI SQL Editor'e yapıştırıp Run'a bas:
supabase/migrations/20261109190000_create_game_profiles.sql

3) SUPABASE CLI'YI KUR (BİR KEZ)
Terminal:
brew install supabase/tap/supabase

4) SUPABASE CLI GİRİŞİ VE PROJE BAĞLANTISI
Terminal:
supabase login
supabase link --project-ref pfzyxueduypesaqfwnrf

`supabase login` tarayıcıda/terminalde Supabase hesabına giriş ister. Kişisel erişim tokenini veya herhangi bir gizli anahtarı kimseyle paylaşma. Publishable key bu HTML'e yerleştirilmiştir ve tarayıcıda kullanılmak içindir. Secret/service_role anahtarı HTML'e kesinlikle eklenmez; Edge Function bunu Supabase'in sunucu ortamından alır.

5) EDGE FUNCTION'I YAYIMLA
Ana proje klasöründeyken:
supabase functions deploy game-api --use-api

6) FIREBASE HOSTING + KURALLARI YAYIMLA
Aynı klasörde:
firebase deploy --project roblox-clicker07 --only hosting,firestore:rules

7) FIREBASE AUTH KONTROLÜ
Firebase Console > Authentication > Sign-in method bölümünde Email/Password açık olmalı. Authentication > Settings > Authorized domains bölümünde roblox-clicker07.web.app bulunmalı. Giriş sistemi Firebase Auth olarak kalır.

TEST
https://roblox-clicker07.web.app adresini aç. Bulut modunda giriş yap. Yeni güvenli profil oluşturulmalı. 50 tıklamayı tamamlayınca günlük görev 520 R$ vermeli. Yükseltme al, sayfayı yenile ve bakiyenin sunucudan geri geldiğini kontrol et.

SINIRLAR VE GÜVENLİK
- Oyun para miktarını tarayıcıdan göndermez; sunucu eylemi hesaplar ve profili saklar.
- Firebase ID tokenı Edge Function içinde doğrulanır.
- Firestore'a doğrudan tarayıcı okuma/yazma tamamen kapalıdır.
- Bu sistem sahte bakiye/yükseltme yazılmasını ciddi biçimde engeller; hiçbir çevrimiçi oyun botları ve otomasyonları yüzde yüz engelleyemez.
- Supabase Free planının Edge Function kullanım kotası vardır; yoğun kullanımda kota aşılabilir veya geçici sınırlamalar görülebilir.
- Henüz canlı Supabase projenizde SQL çalıştırılmadı ve Edge Function dağıtılmadı. Bu dosyalar hazırlanmıştır; canlı dağıtım sonrası test gerekir.
