// src/data/floors.js

const basementAps = [
  {
    id: "B00", x: 65.2, y: 51.3,
    note: "新館空曠區域",
    csie_bssid: "30-87-D9-31-6B-29",
    csie_rssi: -59,
    csie_Rx_rate: 9.4,
    csie_Tx_rate: 11.6,
    bssid: "30-87-D9-71-6B-2C",
    rssi: -36,
    Rx_rate: 168.2,
    Tx_rate: 159.9
  },
  {
    id: "B02", x: 74.8, y: 69.3,
    note: "裏新館閱讀室",
    csie_bssid: "F8-E7-1E-26-45-39",
    csie_rssi: -37,
    csie_Rx_rate: 49.2,
    csie_Tx_rate: 38.2,
    bssid: "F8-E7-1E-66-45-3C",
    rssi: -37,
    Rx_rate: 220.7,
    Tx_rate: 188.4
  },
  {
    id: "B05", x: 30.6, y: 42.9,
    note: "研究室外走道",
    csie_bssid: "30-87-D9-31-7F-C9",
    csie_rssi: -35,
    csie_Rx_rate: 19.4,
    csie_Tx_rate: 4.2,
    bssid: "30-87-D9-71-7F-CC",
    rssi: -36,
    Rx_rate: 218.2,
    Tx_rate: 275.9
  },
  {
    id: "B04_zero", x: 62.2, y: 73.7,
    note: "研究生休息區",
    csie_bssid: "34-8F-27-1E-7A-89",
    csie_rssi: -34,
    csie_Rx_rate: 47.5,
    csie_Tx_rate: 27.0,
    bssid: "34-8F-27-5E-7A-8C",
    rssi: -35,
    Rx_rate: 241.1,
    Tx_rate: 212.5
  },
  {
    id: "B09", x: 38.0, y: 63.0,
    note: "大三區內",
    csie_bssid: "30-87-D9-31-96-E9",
    csie_rssi: -34,
    csie_Rx_rate: 41.7,
    csie_Tx_rate: 24.3,
    bssid: "30-87-D9-71-96-EC",
    rssi: -57,
    Rx_rate: 150.3,
    Tx_rate: 176.4
  },
  {
    id: "b15", x: 53.5, y: 69.0,
    note: "舊館空曠區域",
    csie_bssid: "30-87-D9-31-96-49",
    csie_rssi: -52,
    csie_Rx_rate: 13.9,
    csie_Tx_rate: 60.0,
    bssid: "30-87-D9-71-96-4C",
    rssi: -39,
    Rx_rate: 194.4,
    Tx_rate: 194.4
  }
];

const floor1Aps = [
  {
    id: "R101",
    x: 42.1, y: 55,
    note: "101教室",
    csie_bssid: "30-87-D9-31-55-49",
    csie_rssi: -31,
    csie_Rx_rate: 43.4,
    csie_Tx_rate: 41.7,
    bssid: "30-87-D9-71-55-4C",
    rssi: -34,
    Rx_rate: 250,
    Tx_rate: 241.3
  },
  { id: "R102",
    x: 63,
    y: 67,
    note: "102教室",
    csie_bssid: "30-87-D9-31-79-E9",
    csie_rssi: -41,
    csie_Rx_rate: 40.1,
    csie_Tx_rate: 31.1,
    bssid: "30-87-D9-71-79-EC",
    rssi: -30,
    Rx_rate: 256.4,
    Tx_rate: 231.5
  },
  { id: "R103-front",
    x: 18.6,
    y: 60,
    note: "103教室前面",
    csie_bssid: "",
    csie_rssi: -1,
    csie_Rx_rate: -1,
    csie_Tx_rate: -1,
    bssid: "30-87-D9-71-98-CC",
    rssi: -40,
    Rx_rate: 172.2,
    Tx_rate: 159
  },
  { id: "R103-rear", x: 34.3, y: 65.6, note: "" },
  { id: "R104",
    x: 63,
    y: 54,
    note: "104教室",
    csie_bssid: "34-8F-27-1A-E4-C9",
    csie_rssi: -27,
    csie_Rx_rate: 24.4,
    csie_Tx_rate: 56.4,
    bssid: "34-8F-27-5A-E4-CC",
    rssi: -33,
    Rx_rate: 162.4,
    Tx_rate: 92.7
  },
  { id: "R105",
    x: 25,
    y: 48,
    note: "105教室",
    csie_bssid: "30-87-D9-31-6B-A9",
    csie_rssi: -29,
    csie_Rx_rate: 55.5,
    csie_Tx_rate: 31.8,
    bssid: "30-87-D9-31-6B-AC",
    rssi: -33,
    Rx_rate: 244.7,
    Tx_rate: 264.9
  },
  { id: "R106",
    x: 61.8,
    y: 42,
    note: "106教室",
    csie_bssid: "30-87-D9-31-52-49",
    csie_rssi: -60,
    csie_Rx_rate: 25.7,
    csie_Tx_rate: 27.2,
    bssid: "30-87-D9-71-99-4C",
    rssi: -62,
    Rx_rate: 141,
    Tx_rate: 157.7
  },
  { id: "R107",
    x: 25.2,
    y: 25,
    note: "107教室",
    csie_bssid: "30-87-D9-31-59-89",
    csie_rssi: -40,
    csie_Rx_rate: 49.7,
    csie_Tx_rate: 27.3,
    bssid: "30-87-D9-71-59-8C",
    rssi: -40,
    Rx_rate: 253.4,
    Tx_rate: 236.3
  },
  { id: "R108",
    x: 64.4,
    y: 31.3,
    note: ""
  },
  { id: "R110",
    x: 71.0,
    y: 41,
    note: "110教室",
    csie_bssid: "	30-87-D9-31-52-49",
    csie_rssi: -25,
    csie_Rx_rate: 68.4,
    csie_Tx_rate: 35.4,
    bssid: "30-87-D9-71-52-4C",
    rssi: -35,
    Rx_rate: 273.4,
    Tx_rate: 235.5
  },
  { id: "R111",
    x: 33,
    y: 31.2,
    note: "111教室",
    csie_bssid: "	30-87-D9-31-83-09",
    csie_rssi: -31,
    csie_Rx_rate: 37,
    csie_Tx_rate: 54.3,
    bssid: "30-87-D9-71-83-0C",
    rssi: -38,
    Rx_rate: 227.1,
    Tx_rate: 239.1
  }
];

const floor2Aps = [
  { id: "R201",
    x: 53.8,
    y: 64.5,
    note: ""
  },
  { id: "R202",
    x: 64.7,
    y: 69.6,
    note: ""
  },
  { id: "R204",
    x: 64.7,
    y: 54,
    note: ""
  },
  { id: "R208",
    x: 61,
    y: 39,
    note: ""
  },
  { id: "R210",
    x: 73.3,
    y: 36,
    note: ""
  },
  { id: "R205",
    x: 40.2,
    y: 66.5,
    note: ""
  },
  { id: "R209",
    x: 27.4,
    y: 72,
    note: ""
  },
  { id: "R214",
    x: 59.5,
    y: 30.8,
    note: ""
  },
  { id: "R218",
    x: 48,
    y: 30.8,
    note: ""
  },
  { id: "R217",
    x: 31.4,
    y: 53.4,
    note: ""
  },
  { id: "R219",
    x: 31.4,
    y: 42.5,
    note: ""
  },
  { id: "R223-A",
    x: 21.5,
    y: 28.5,
    note: ""
  }
];
const floor3Aps = [
  {
    id: "R303",
    x: 44.2,
    y: 53,
    note: ""
  },
  {
    id: "R305",
    x: 33.7,
    y: 53,
    note: ""
  },
  {
    id: "R306",
    x: 67.5,
    y: 53,
    note: ""
  },
  {
    id: "R309",
    x: 23.5,
    y: 71,
    note: ""
  },
  {
    id: "R310",
    x: 74.3,
    y: 71.5,
    note: ""
  },
  {
    id: "R317",
    x: 23.5,
    y: 60.5,
    note: ""
  },
  {
    id: "R318",
    x: 74.3,
    y: 60,
    note: ""
  },
  {
    id: "R321",
    x: 23.5,
    y: 48.3,
    note: ""
  },
  {
    id: "R324",
    x: 74.3,
    y: 46.5,
    note: ""
  },
  {
    id: "R327",
    x: 23.5,
    y: 32.5,
    note: ""
  },
  {
    id: "R328",
    x: 74.3,
    y: 36,
    note: ""
  },
  {
    id: "R331",
    x: 23.5,
    y: 21,
    note: ""
  },
  {
    id: "R332",
    x: 74.3,
    y: 19,
    note: ""
  },
  {
    id: "R338",
    x: 63.6,
    y: 28.4,
    note: ""
  },
  {
    id: "R342",
    x: 55,
    y: 28.4,
    note: ""
  },
  {
    id: "R344",
    x: 45.3,
    y: 28.4,
    note: ""
  }
];
const floor4Aps = [
  { id: "R401",
    x: 44.6,
    y: 59.5,
    note: ""
  },
  { id: "R402",
    x: 65.7,
    y: 62,
    note: ""
  },
  { id: "R405",
    x: 30.5,
    y: 58.7,
    note: ""
  },
  { id: "R409",
    x: 20.6,
    y: 78.9,
    note: ""
  },
  { id: "R410",
    x: 76.8,
    y: 78.5,
    note: ""
  },
  { id: "R417",
    x: 20.6,
    y: 63,
    note: ""
  },
  { id: "R418",
    x: 76.8,
    y: 64,
    note: ""
  },
  { id: "R423",
    x: 18.4,
    y: 48,
    note: ""
  },
  { id: "R424",
    x: 76.8,
    y: 49,
    note: ""
  },
  { id: "R428",
    x: 76.8,
    y: 36,
    note: ""
  },
  { id: "R432",
    x: 76.8,
    y: 21,
    note: ""
  },
  { id: "R433",
    x: 20.6,
    y: 23,
    note: ""
  },
  { id: "R438",
    x: 69.5,
    y: 31.7,
    note: ""
  },
  { id: "R439",
    x: 23.4,
    y: 36,
    note: ""
  },
  { id: "R442",
    x: 55.2,
    y: 31.7,
    note: ""
  },
  { id: "R444",
    x: 45.7,
    y: 31.7,
    note: ""
  }
];
const floor5Aps = [
  { id: "R501",
    x: 45,
    y: 57,
    note: ""
  },
  { id: "R502",
    x: 67.6,
    y: 59,
    note: ""
  },
  { id: "R505",
    x: 33.9,
    y: 55.8,
    note: ""
  },
  { id: "R509",
    x: 19.2,
    y: 79,
    note: ""
  },
  { id: "R510",
    x: 80.2,
    y: 80,
    note: ""
  },
  { id: "R517",
    x: 19,
    y: 62,
    note: ""
  },
  { id: "R518",
    x: 80,
    y: 63,
    note: ""
  },
  { id: "R523",
    x: 17,
    y: 43,
    note: ""
  },
  { id: "R524",
    x: 80.2,
    y: 48.7,
    note: ""
  },
  { id: "R528",
    x: 80,
    y: 32,
    note: ""
  },
  { id: "R531",
    x: 20.6,
    y: 23.5,
    note: ""
  },
  { id: "R532",
    x: 80.1,
    y: 13.4,
    note: ""
  },
  { id: "R538",
    x: 67.2,
    y: 23.8,
    note: ""
  },
  { id: "R539",
    x: 23.3,
    y: 35.6,
    note: ""
  },
  { id: "R542",
    x: 56.15,
    y: 24,
    note: ""
  },
  { id: "R544",
    x: 46.2,
    y: 24,
    note: ""
  },
];
const floor6Aps = [
  { id: "R600",
    x: 14.2,
    y: 65,
    note: ""
  },
  { id: "R601",
    x: 25.4,
    y: 43,
    note: ""
  },
  { id: "R603",
    x: 38.5,
    y: 68.2,
    note: ""
  },
  { id: "R605",
    x: 59.2,
    y: 68.2,
    note: ""
  },
];

export const floors = {
  basement: {
    id: "basement",
    label: "地下室",
    title: "系館地下室 AP 地圖",
    subtitle: "地下室 AP 點位示意圖",
    imageUrl: "/images/floor-plan-B1.svg",
    width: 1620,
    height: 1200,
    aps: basementAps,
  },

  floor1: {
    id: "floor1",
    label: "一樓",
    title: "系館一樓 AP 地圖",
    subtitle: "一樓 AP 點位示意圖",
    imageUrl: "/images/floor-plan-1F.svg",
    width: 1620,
    height: 1200,
    aps: floor1Aps,
  },

  floor2: {
    id: "floor2",
    label: "二樓",
    title: "系館二樓 AP 地圖",
    subtitle: "二樓 AP 點位示意圖",
    imageUrl: "/images/floor-plan-2F.svg",
    width: 1620,
    height: 1200,
    aps: floor2Aps,
  },

  floor3: {
    id: "floor3",
    label: "三樓",
    title: "系館三樓 AP 地圖",
    subtitle: "三樓 AP 點位示意圖",
    imageUrl: "/images/floor-plan-3F.svg",
    width: 1620,
    height: 1200,
    aps: floor3Aps,
  },

  floor4: {
    id: "floor4",
    label: "四樓",
    title: "系館四樓 AP 地圖",
    subtitle: "四樓 AP 點位示意圖",
    imageUrl: "/images/floor-plan-4F.svg",
    width: 1600,
    height: 1200,
    aps: floor4Aps,
  },

  floor5: {
    id: "floor5",
    label: "五樓",
    title: "系館五樓 AP 地圖",
    subtitle: "五樓 AP 點位示意圖",
    imageUrl: "/images/floor5_page.png",
    width: 1684,
    height: 1580,
    aps: floor5Aps,
  },

  floor6: {
    id: "floor6",
    label: "六樓",
    title: "系館六樓 AP 地圖",
    subtitle: "六樓 AP 點位示意圖",
    imageUrl: "/images/floor-plan-6F.svg",
    width: 1600,
    height: 1200,
    aps: floor6Aps,
  },
};
