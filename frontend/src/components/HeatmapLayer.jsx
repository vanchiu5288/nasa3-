import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatmapLayer({ points, width, height, paneName = "heatmap-pane" }) {
  const map = useMap();

  useEffect(() => {
    let pane = map.getPane(paneName);

    if (!pane) {
      pane = map.createPane(paneName);
      pane.style.zIndex = "350";
      pane.style.pointerEvents = "none";
    }

    const heatData = (points || [])
      .filter(
        (p) =>
          typeof p.x === "number" &&
          typeof p.y === "number" &&
          typeof p.value === "number"
      )
      .map((p) => {
        const pxX = (p.x / 100) * width;
        const pxY = height - (p.y / 100) * height;
        return [pxY, pxX, p.value];
      });

    if (heatData.length === 0) {
      pane.style.clipPath = "";
      return;
    }

    function updateClip() {
      const topLeft = map.latLngToContainerPoint([height, 0]);
      const bottomRight = map.latLngToContainerPoint([0, width]);
      const size = map.getSize();

      const top = Math.max(0, topLeft.y);
      const left = Math.max(0, topLeft.x);
      const right = Math.max(0, size.x - bottomRight.x);
      const bottom = Math.max(0, size.y - bottomRight.y);

      pane.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    }

    const layer = L.heatLayer(heatData, {
      pane: paneName,
      radius: 60,
      blur: 40,
      minOpacity: 0.18,
      maxZoom: 2,
      max: 1.0,
      gradient: {
        0.05: "#1e3a8a",
        0.2: "#2563eb",
        0.4: "#22c55e",
        0.65: "#facc15",
        0.85: "#fb923c",
        1.0: "#ef4444",
      },
    });

    layer.addTo(map);
    updateClip();

    map.on("zoom move resize", updateClip);

    return () => {
      map.off("zoom move resize", updateClip);
      map.removeLayer(layer);
    };
  }, [points, width, height, map, paneName]);

  return null;
}
