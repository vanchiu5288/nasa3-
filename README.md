# Integrated frontend files

Place these files into your Vite React `src/` directory:

src/App.jsx
src/main.jsx
src/data/floors.js
src/components/HeatmapLayer.jsx
src/pages/AutomaticHeatmap.jsx
src/pages/ManualSpeedTest.jsx

Required package:
npm install react-router-dom

Backend routes expected:
GET  /api/heatmap/?floor=<floor>&ssid=<ssid>&metric=rssi
GET  /api/heatmap/?floor=<floor>&ssid=<ssid>&metric=speed
GET  /api/iperf/download/
POST /api/heatmap/measurements/create/
