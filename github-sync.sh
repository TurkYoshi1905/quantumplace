#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  QuantumPlace — GitHub Sync Script
#
#  Kullanım:
#    bash github-sync.sh push ["commit mesajı"]   → GitHub'a gönder
#    bash github-sync.sh pull                     → GitHub'dan çek
#
#  Nasıl çalışır (push):
#    1) Repo /tmp altına klonlanır — git geçmişi korunur.
#    2) Klonun içi temizlenir (git rm -rf .)
#    3) artifacts/quantum-place/ kaynak dosyaları kopyalanır.
#    4) Commit + push → GitHub güncellenir.
#
#  ÖNEMLİ: Bu script Replit monorepo yapısını GitHub'a GÖNDERMEZ.
#           Yalnızca gerçek uygulama dosyaları gönderilir.
#           git push --force kesinlikle kullanılmaz.
# ─────────────────────────────────────────────────────────────────────────────

set -e

MODE="${1:-push}"
COMMIT_MSG="${2:-feat: QuantumPlace güncelleme — r/place UI, 5x zoom, crosshair, IndexedDB}"
BRANCH="main"
WORKSPACE="/home/runner/workspace"
QUANTUM_DIR="$WORKSPACE/artifacts/quantum-place"
DEPLOY_TMP="/tmp/quantumplace-deploy-$$"

# GITHUB_PAT zorunlu
if [ -z "$GITHUB_PAT" ]; then
  echo "❌ GITHUB_PAT çevre değişkeni tanımlı değil."
  echo "   Replit Secrets bölümüne GITHUB_PAT ekleyin ve tekrar deneyin."
  exit 1
fi

REPO_URL="https://TurkYoshi1905:${GITHUB_PAT}@github.com/TurkYoshi1905/quantumplace.git"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║         QuantumPlace — GitHub Sync Script          ║"
echo "║  Mod    : $MODE                                    ║"
echo "║  Dal    : $BRANCH                                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# ─── PUSH ────────────────────────────────────────────────────────────────────
if [ "$MODE" = "push" ]; then

  echo "▶ [1/5] GitHub deposu klonlanıyor (geçmiş korunuyor)..."
  rm -rf "$DEPLOY_TMP"
  git clone "$REPO_URL" "$DEPLOY_TMP" --quiet
  cd "$DEPLOY_TMP"
  git config user.name "TurkYoshi1905"
  git config user.email "165286969+TurkYoshi1905@users.noreply.github.com"
  echo "  ✓ Klonlandı."

  echo ""
  echo "▶ [2/5] Eski dosyalar temizleniyor (git rm)..."
  git rm -rf . --quiet 2>/dev/null || true
  echo "  ✓ Temizlendi."

  echo ""
  echo "▶ [3/5] Kaynak kodlar kopyalanıyor (artifacts/quantum-place/)..."

  # src/
  rm -rf "$DEPLOY_TMP/src"
  cp -r "$QUANTUM_DIR/src" "$DEPLOY_TMP/src"
  SRC_COUNT=$(find "$DEPLOY_TMP/src" -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')
  echo "  ✓ src/ kopyalandı ($SRC_COUNT TypeScript dosyası)."

  # public/
  if [ -d "$QUANTUM_DIR/public" ]; then
    rm -rf "$DEPLOY_TMP/public"
    cp -r "$QUANTUM_DIR/public" "$DEPLOY_TMP/public"
    echo "  ✓ public/ kopyalandı."
  fi

  # Yapılandırma dosyaları
  for f in index.html vite.config.ts tsconfig.json tsconfig.app.json package.json tailwind.config.ts postcss.config.js; do
    if [ -f "$QUANTUM_DIR/$f" ]; then
      cp "$QUANTUM_DIR/$f" "$DEPLOY_TMP/$f"
      echo "  ✓ $f kopyalandı."
    fi
  done

  # github-sync.sh (bu script)
  cp "$QUANTUM_DIR/github-sync.sh" "$DEPLOY_TMP/github-sync.sh"
  echo "  ✓ github-sync.sh eklendi."

  # replit.md
  if [ -f "$WORKSPACE/replit.md" ]; then
    cp "$WORKSPACE/replit.md" "$DEPLOY_TMP/replit.md"
    echo "  ✓ replit.md eklendi."
  fi

  # README.md
  if [ -f "$WORKSPACE/README.md" ]; then
    cp "$WORKSPACE/README.md" "$DEPLOY_TMP/README.md"
    echo "  ✓ README.md eklendi."
  fi

  echo ""
  echo "▶ [4/5] Gönderilecek dosyalar kontrol ediliyor..."
  cd "$DEPLOY_TMP"
  git add -A
  CHANGED=$(git status --porcelain | wc -l)

  if [ "$CHANGED" -eq 0 ]; then
    echo "  ✓ Gönderilecek değişiklik yok — her şey zaten güncel."
  else
    echo "  → $CHANGED dosyada değişiklik var."

    echo ""
    echo "▶ [5/5] Commit & Push yapılıyor..."
    git commit -m "$COMMIT_MSG"
    git push origin "$BRANCH"

    echo ""
    echo "════════════════════════════════════════════════════"
    echo "  ✅ Başarılı! GitHub başarıyla güncellendi."
    echo "  🔗 https://github.com/TurkYoshi1905/quantumplace"
    echo "════════════════════════════════════════════════════"
  fi

  # Temp dizini temizle
  cd "$WORKSPACE"
  rm -rf "$DEPLOY_TMP"
  echo "  ✓ Geçici dosyalar temizlendi."

# ─── PULL ────────────────────────────────────────────────────────────────────
elif [ "$MODE" = "pull" ]; then

  echo "▶ [1/2] GitHub deposu çekiliyor..."
  rm -rf "$DEPLOY_TMP"
  git clone --depth=1 "$REPO_URL" "$DEPLOY_TMP" --quiet
  echo "  ✓ Klonlandı."

  echo ""
  echo "▶ [2/2] src/ ve public/ aktarılıyor → artifacts/quantum-place/..."
  rm -rf "$QUANTUM_DIR/src"    && cp -r "$DEPLOY_TMP/src"    "$QUANTUM_DIR/src"
  rm -rf "$QUANTUM_DIR/public" && cp -r "$DEPLOY_TMP/public" "$QUANTUM_DIR/public"
  cp "$DEPLOY_TMP/index.html"    "$QUANTUM_DIR/index.html"    2>/dev/null || true
  cp "$DEPLOY_TMP/package.json"  "$QUANTUM_DIR/package.json"  2>/dev/null || true

  cd "$WORKSPACE"
  rm -rf "$DEPLOY_TMP"

  echo ""
  echo "════════════════════════════════════════════════════"
  echo "  ✅ GitHub'tan başarıyla çekildi."
  echo "════════════════════════════════════════════════════"

else
  echo "Kullanım:"
  echo "  bash github-sync.sh push [\"commit mesajı\"]"
  echo "  bash github-sync.sh pull"
  exit 1
fi
