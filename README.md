# UniPlanner — Ders Programı & Not Takibi

Üniversite ders programı, haftalık notlar, ödev takibi ve yoklama yönetimi için PWA.
React 19 + Vite + Firebase (Auth + Firestore).

## Özellikler

- **Program:** Telefonda günlük ajanda, geniş ekranda haftalık ızgara (şu anki saat çizgisi,
  çakışan dersler yan yana, hafta sonu dersleri). Bir ders haftada birden fazla gün/saatte olabilir.
- **Bugün paneli:** Günün dersleri ve yaklaşan ödevler.
- **Ders detayı:** Haftalık notlar (otomatik kayıt), ödevler, yoklama + devamsızlık hakkı uyarısı.
- **Ödevler:** Teslim tarihine göre gruplanmış (gecikmiş, bugün/yarın, bu hafta…), derse göre filtre.
- **Özet:** Genel devam oranı, devamsızlık sınırına yaklaşan dersler, ödev ilerlemesi.
- **Ayarlar:** Açık/koyu/sistem teması, dönem başlangıcı ve hafta sayısı (bulunulan hafta otomatik işaretlenir).

## Geliştirme

```bash
npm install
npm run dev     # geliştirme sunucusu
npm run build   # üretim derlemesi
npm run lint    # oxlint
```

Firebase ayarları `.env` dosyasından okunur (`.env.example`'a bakın).

## Firebase / Vercel notları

- **Authorized domains:** Firebase Console → Authentication → Settings → Authorized domains
  listesine Vercel alan adınızı (örn. `uni-planner-xi.vercel.app`) ekleyin.
- **Firestore kuralları:** `firestore.rules` dosyasını Firebase Console'a yayınlayın
  (her kullanıcı yalnızca `users/{uid}` altındaki verisine erişebilir).
- **Safari / iOS'ta giriş sorunu (isteğe bağlı):** `vercel.json`, `/__/auth/*` isteklerini
  Firebase'e yönlendirir. Redirect ile girişin Safari'de de çalışması için:
  1. Google Cloud Console → APIs & Services → Credentials → OAuth istemcisine
     `https://<alan-adınız>/__/auth/handler` adresini *Authorized redirect URI* olarak ekleyin.
  2. Vercel ortam değişkeni `VITE_FIREBASE_AUTH_DOMAIN=<alan-adınız>` olarak ayarlayın ve yeniden deploy edin.
