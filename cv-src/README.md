# CV kaynaklari

`assets/KaanCanKurt_CV.pdf` (TR) ve `assets/KaanCanKurt_ENG_CV.pdf` (EN) bu klasordeki
HTML dosyalarindan uretilir. PDF'leri elle duzenleme — kaynagi duzenle, yeniden uret.

## Dosyalar

| Dosya | Ne ise yarar |
|---|---|
| `cv_tr.html` | Turkce CV icerigi |
| `cv_en.html` | Ingilizce CV icerigi |
| `cv.css` | Ikisinin ortak tasarimi (A4, Helvetica Neue, bolum basliklari) |
| `build.sh` | Headless Chrome ile ikisini de PDF'e basar |

## Guncelleme

1. Ilgili `cv_*.html` dosyasini duzenle. **Iki dili de ayni anda guncelle**, yoksa
   TR ve EN surumleri birbirinden ayrisir.
2. PDF'leri uret:

   ```bash
   ./cv-src/build.sh
   ```

3. Tek sayfada kaldigini dogrula (build.sh sayfa sayisini yazar).

## Kurallar

- **Tek sayfa sinirdir.** Iki sayfaya tastiysa once icerik kis, punto kucultme son care.
- **Proje basina en fazla 3 madde**: (1) ne oldugu, (2) veri/backend tarafi, (3) test/deploy tarafi.
  Derin teknik detay CV'ye degil, projenin kendi README'sine ve siteye ait.
- **Beceri satirlari anahtar kelime icindir.** IK otomatik tarama yapiyor; sadece
  gercekten kullandigin teknolojileri ekle.
- **Diller ve seviyeler `index.html` + `script.js` icindeki site metinleriyle ayni olmali.**
  Sitedeki karsiliklari: `lang.de.level`, `lang.en.level` ceviri anahtarlari.
- Iletisim linkleri `<a href>` olarak duruyor; PDF'te tiklanabilir kalmalarinin sebebi bu.
