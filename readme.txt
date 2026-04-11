做好設計網頁的環境建置:
1.先更新apt
sudo apt update && sudo apt upgrade -y
2.下載curl(用他抓nvm)
sudo apt-get install -y curl
3.安裝nvm(安裝完要重開terminal)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
(-o是curl的output 選項)(- 是標準的stdout)
4.安裝node.js
nvm install --lts
nvm install node
5.在linux家目錄建立專案
建好後用npm create 一個資料夾(網頁最起始的資料夾)
npm create vite@latest frontend(選react跟javascript(不用選有react compiler的，那個是優化用的，之後想要也可以安裝))
cd frontend
npm install 
npm run dev(讓server啟動，這樣才能檢視網頁)
我的網站路徑:
http://localhost:5173/
6.安裝leaflet
npm install leaflet react-leaflet

