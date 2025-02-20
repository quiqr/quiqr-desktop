echo "This is made for distrobox with ubuntu 24.04"
npm install
npm install @kurkle/color
NODE_OPTIONS=--openssl-legacy-provider npm run build
npm exec electron-builder
cp dist/quiqr_0.19.4_linux_x86_64.AppImage /tmp
