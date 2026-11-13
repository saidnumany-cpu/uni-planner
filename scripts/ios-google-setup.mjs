// GoogleService-Info.plist içindeki REVERSED_CLIENT_ID'yi iOS Info.plist'e URL şeması olarak ekler.
// Google ile girişin iOS uygulamasında geri dönebilmesi için gerekli. Tekrar çalıştırmak güvenli.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const gsPath = 'ios/App/App/GoogleService-Info.plist';
const infoPath = 'ios/App/App/Info.plist';

if (!existsSync(gsPath)) {
  console.warn(`\n⚠️  ${gsPath} bulunamadı.`);
  console.warn('   Firebase Console → Proje ayarları → iOS uygulaması ekle (paket kimliği: com.saidnumany.uniplanner)');
  console.warn('   indirdiğin GoogleService-Info.plist dosyasını bu konuma koy ve komutu tekrar çalıştır.\n');
  process.exit(0);
}

const gs = readFileSync(gsPath, 'utf8');
const match = gs.match(/<key>REVERSED_CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/);
if (!match) {
  console.error('GoogleService-Info.plist içinde REVERSED_CLIENT_ID yok. Firebase Console\'da Google girişinin açık olduğundan emin olup dosyayı yeniden indir.');
  process.exit(1);
}
const scheme = match[1].trim();

let info = readFileSync(infoPath, 'utf8');
if (info.includes(scheme)) {
  console.log('✓ Google URL şeması zaten ekli.');
  process.exit(0);
}

const block = `\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLRole</key>
\t\t\t<string>Editor</string>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>${scheme}</string>
\t\t\t</array>
\t\t</dict>
\t</array>
`;

if (info.includes('<key>CFBundleURLTypes</key>')) {
  console.error('Info.plist zaten başka bir CFBundleURLTypes içeriyor; şemayı Xcode → Info → URL Types bölümünden elle ekle:', scheme);
  process.exit(1);
}

info = info.replace(/<\/dict>\s*<\/plist>\s*$/, `${block}</dict>\n</plist>\n`);
writeFileSync(infoPath, info);
console.log('✓ Google URL şeması Info.plist\'e eklendi:', scheme);
