import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { LoadMap } from "./LoadMap";

interface Props {}

export const LocationMap = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  useEffect(() => {
    var container = document.querySelector("#stage-parent");
    // @ts-ignore
    stageRef.current?.width(container?.offsetWidth || 500);
    // @ts-ignore
    setMaxHeight(container?.offsetHeight || 500);
    // @ts-ignore
    setMaxWidth(container?.offsetWidth || 500);
    // @ts-ignore
    stageRef.current?.height(container?.offsetHeight || 600);
  }, []);

  return (
    <div className="m-5 w-2/3 h-1/2" id="stage-parent">
      <Stage
        ref={stageRef}
        width={500}
        height={500}
        className="bg-slate-200 border-2 border-blue-600"
      >
        <Layer>
          <LoadMap
            url={
              "https://tabex-logo.s3.ap-southeast-2.amazonaws.com/FLOOR-PLAN-BUILDINGS.jpg"
            }
            mapHeight={maxHeight}
            mapWidth={maxWidth}
          />
        </Layer>
      </Stage>
    </div>
  );
};
