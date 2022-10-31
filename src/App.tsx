import { useState } from "react";
import { LocationMap } from "./LocationMap";

export const App = () => {
  const [markerMode, setMarkerMode] = useState(false);

  const handleSetLocation = (x: number, y: number) => {};
  return (
    <div className="h-screen w-full">
      <div className="w-full h-full">
        <LocationMap
          markerMode={markerMode}
          setMarkerMode={(x: boolean) => setMarkerMode(x)}
          setLocation={handleSetLocation}
        />
      </div>
    </div>
  );
};
