虛擬環境建置:
python3 -m venv .venv
source .venv/bin/activate
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

Django安裝流程:
//虛擬環境安裝套件
python -m pip install -r requirements.txt
python -m pip install django-cors-headers

pip install django
python -m django --version//確認版本
django-admin startproject config . //這個不用做因為我做的時候已經先做一次config了
python manage.py runserver  //開啟後端的server(可以去連覽器查看http://127.0.0.1:8000/)
python manage.py startapp heatmap //heatmap改成其他要創建的app
範例:
backend/
  manage.py
  config/
    settings.py
    urls.py
  heatmap/
    __init__.py
    admin.py
    apps.py
    models.py
    tests.py
    views.py
    migrations/
      __init__.py

nano config/settings.py  //把app加入config中
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'heatmap',
]

nano heatmap/models.py //建立資料模型(用來決定你把資料post上去的格式)
python manage.py makemigrations //建立migration檔(根據 models.py 的變化，產生資料庫變更紀錄檔)
python manage.py migrate //Django會更改資料庫並建立db.sqlite3

從後台看資料:
python manage.py createsuperuser
python manage.py runserver
http://127.0.0.1:8000/admin/

系上工作站:ws1.csie.ntu.edu.tw
wifi1的ip:172.16.127.110

