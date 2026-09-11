#!/usr/bin/env bash
# CV kaynaklarindan (cv_tr.html / cv_en.html) PDF uretir ve assets/ icine yazar.
# Kullanim:  ./cv-src/build.sh
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$(cd "$SRC/.." && pwd)/assets"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "Google Chrome bulunamadi: $CHROME" >&2
  exit 1
fi

build() {  # $1 = dil kodu, $2 = cikti dosya adi
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$OUT/$2" "file://$SRC/cv_$1.html" 2>/dev/null
  echo "  $2  ->  $(command -v pdfinfo >/dev/null && pdfinfo "$OUT/$2" | awk '/^Pages/{print $2" sayfa"}')"
}

echo "CV uretiliyor:"
build tr KaanCanKurt_CV.pdf
build en KaanCanKurt_ENG_CV.pdf
echo "Bitti. Tek sayfayi astiysa cv.css icindeki font-size / line-height degerlerini kis."
