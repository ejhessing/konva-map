import { useState } from "react";
import { LocationMap } from "./LocationMap";

export const App = () => {
  const [markerMode, setMarkerMode] = useState(false);
  const [markerLocation, setMarkerLocation] = useState({
    x: 0.07,
    y: 0.34,
  });

  const handleSetLocation = ({ x, y }: { x: number; y: number }) => {
    setMarkerLocation({ x, y });
    setMarkerMode(false);
  };
  return (
    <div className="h-screen w-full">
      <div className="w-full h-full">
        <LocationMap
          markerMode={markerMode}
          setMarkerMode={(x: boolean) => setMarkerMode(x)}
          setMarkerLocation={handleSetLocation}
          markerLocation={markerLocation}
        />
      </div>
    </div>
  );
};
