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
#    4) catalog: bağımlılıkları gerçek versiyonlara çözülür (npm uyumluluğu).
#    5) Vercel-uyumlu vite.config.ts oluşturulur.
#    6) Commit + push → GitHub güncellenir.
#
#  ÖNEMLİ: Bu script Replit monorepo yapısını GitHub'a GÖNDERMEZ.
#           Yalnızca gerçek uygulama dosyaları gönderilir.
#           git push --force kesinlikle kullanılmaz.
# ─────────────────────────────────────────────────────────────────────────────

set -e

MODE="${1:-push}"
COMMIT_MSG="${2:-feat: QuantumPlace güncelleme}"
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

  echo "▶ [1/6] GitHub deposu klonlanıyor (geçmiş korunuyor)..."
  rm -rf "$DEPLOY_TMP"
  git clone "$REPO_URL" "$DEPLOY_TMP" --quiet
  cd "$DEPLOY_TMP"
  git config user.name "TurkYoshi1905"
  git config user.email "165286969+TurkYoshi1905@users.noreply.github.com"
  echo "  ✓ Klonlandı."

  echo ""
  echo "▶ [2/6] Eski dosyalar temizleniyor (git rm)..."
  git rm -rf . --quiet 2>/dev/null || true
  echo "  ✓ Temizlendi."

  echo ""
  echo "▶ [3/6] Kaynak kodlar kopyalanıyor (artifacts/quantum-place/)..."

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

  # Yapılandırma dosyaları (tsconfig.json ve vite.config.ts Vercel için sonraki adımlarda override edilir)
  for f in index.html tailwind.config.ts postcss.config.js; do
    if [ -f "$QUANTUM_DIR/$f" ]; then
      cp "$QUANTUM_DIR/$f" "$DEPLOY_TMP/$f"
      echo "  ✓ $f kopyalandı."
    fi
  done

  # vercel.json
  if [ -f "$QUANTUM_DIR/vercel.json" ]; then
    cp "$QUANTUM_DIR/vercel.json" "$DEPLOY_TMP/vercel.json"
    echo "  ✓ vercel.json kopyalandı."
  fi

  # github-sync.sh (bu script)
  cp "$QUANTUM_DIR/github-sync.sh" "$DEPLOY_TMP/github-sync.sh"
  echo "  ✓ github-sync.sh eklendi."

  # README.md
  if [ -f "$WORKSPACE/README.md" ]; then
    cp "$WORKSPACE/README.md" "$DEPLOY_TMP/README.md"
    echo "  ✓ README.md eklendi."
  fi

  # replit.md
  if [ -f "$WORKSPACE/replit.md" ]; then
    cp "$WORKSPACE/replit.md" "$DEPLOY_TMP/replit.md"
    echo "  ✓ replit.md eklendi."
  fi

  echo ""
  echo "▶ [4/6] catalog: bağımlılıkları çözülüyor ve package.json oluşturuluyor..."

  # package.json: catalog: versiyonlarını gerçek versiyonlara çevir, workspace: kaldır
  export QP_DEPLOY_TMP="$DEPLOY_TMP"
  node << 'NODESCRIPT'
const fs = require('fs');

// pnpm-workspace.yaml'dan catalog: bölümünü parse et
const yaml = fs.readFileSync('/home/runner/workspace/pnpm-workspace.yaml', 'utf8');
const catalog = {};
let inCatalog = false;
for (const line of yaml.split('\n')) {
  if (/^catalog:/.test(line)) { inCatalog = true; continue; }
  if (inCatalog && /^[^\s]/.test(line)) { inCatalog = false; }
  if (inCatalog) {
    const m = line.match(/^\s+'?([^':]+?)'?\s*:\s*(.+)/);
    if (m) catalog[m[1].trim()] = m[2].trim();
  }
}

// Artifact package.json oku
const pkg = JSON.parse(fs.readFileSync('/home/runner/workspace/artifacts/quantum-place/package.json', 'utf8'));

// Kaldırılacak paketler (Replit-özel veya workspace-özel)
const replit_only = new Set([
  '@replit/vite-plugin-cartographer',
  '@replit/vite-plugin-dev-banner',
  '@replit/vite-plugin-runtime-error-modal',
  '@workspace/api-client-react',
]);

// Bağımlılıkları çöz
for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
  if (!pkg[section]) continue;
  for (const [name, ver] of Object.entries(pkg[section])) {
    if (replit_only.has(name)) {
      delete pkg[section][name];
    } else if (ver === 'catalog:') {
      if (catalog[name]) pkg[section][name] = catalog[name];
      else delete pkg[section][name];
    } else if (String(ver).startsWith('workspace:')) {
      delete pkg[section][name];
    }
  }
}

// Gereksiz boş bölümleri kaldır
for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
  if (pkg[section] && Object.keys(pkg[section]).length === 0) delete pkg[section];
}

// Vercel için name temizle
pkg.name = 'quantumplace';

const outPath = process.env.QP_DEPLOY_TMP + '/package.json';
fs.writeFileSync(outPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('  ✓ package.json catalog: bağımlılıkları çözüldü, workspace: deps kaldırıldı.');
NODESCRIPT

  echo ""
  echo "▶ [5/7] Vercel-uyumlu vite.config.ts oluşturuluyor..."

  cat > "$DEPLOY_TMP/vite.config.ts" << 'VITECONFIG'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Vercel build config — PORT/BASE_PATH bağımsız, Replit eklentileri yok
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "public"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
VITECONFIG
  echo "  ✓ vite.config.ts (Vercel uyumlu) oluşturuldu."

  echo ""
  echo "▶ [6/7] Vercel-uyumlu tsconfig.json oluşturuluyor (extends kaldırıldı)..."

  cat > "$DEPLOY_TMP/tsconfig.json" << 'TSCONFIG'
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "noEmit": true,
    "jsx": "preserve",
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["esnext", "dom", "dom.iterable"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "strictBindCallApply": true,
    "alwaysStrict": true,
    "skipLibCheck": true,
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
TSCONFIG
  echo "  ✓ tsconfig.json (standalone, extends yok) oluşturuldu."

  echo ""
  echo "▶ [7/7] Gönderilecek dosyalar kontrol ediliyor..."
  cd "$DEPLOY_TMP"
  git add -A
  CHANGED=$(git status --porcelain | wc -l)

  if [ "$CHANGED" -eq 0 ]; then
    echo "  ✓ Gönderilecek değişiklik yok — her şey zaten güncel."
  else
    echo "  → $CHANGED dosyada değişiklik var."
    echo "  Commit & Push yapılıyor..."
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
