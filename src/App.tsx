import { useState } from "react";
import { LocationMap } from "./LocationMap";

export const App = () => {
  const [markerMode, setMarkerMode] = useState(false);
  const [markerLocation, setMarkerLocation] = useState({
    x: 0,
    y: 0,
  });
  const [tempMarkerLocation, setTempMarkerLocation] = useState({
    x: 0,
    y: 0,
  });

  const handleTempLocation = ({ x, y }: { x: number; y: number }) => {
    setTempMarkerLocation({ x, y });
    // setMarkerMode(false);
  };

  const handleUpdateLocation = ({ x, y }: { x: number; y: number }) => {
    setMarkerLocation({ x, y });
    setMarkerMode(false);
  };

  const handleCancelLocation = () => {
    setMarkerMode(false);
    setTempMarkerLocation({ x: 0, y: 0 });
  };

  const handleSetMarkerMode = (x: boolean) => {
    setMarkerMode(x);
    setTempMarkerLocation({ x: markerLocation.x, y: markerLocation.y });
  };
  return (
    <div className="h-screen w-full">
      <div className="w-full h-full">
        {/* <Test /> */}
        <LocationMap
          markerMode={markerMode}
          handleSetMarkerMode={handleSetMarkerMode}
          setMarkerLocation={handleTempLocation}
          tempMarkerLocation={tempMarkerLocation}
          markerLocation={markerLocation}
          setUpdateLocation={handleUpdateLocation}
          cancelLocation={handleCancelLocation}
        />
      </div>
    </div>
  );
};
