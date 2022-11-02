import { useState } from "react";
import { LocationMap } from "./LocationMap";

export const App = () => {
  const [markerMode, setMarkerMode] = useState(false);
  const [markerLocation, setMarkerLocation] = useState({
    x: 208.447714371968,
    y: 757.4103640190837,
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
