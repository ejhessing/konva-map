import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { ToolBar } from "../Toolbar";
import { LoadMapAndMarkers } from "./LoadMapAndMarkers";

const scaleBy = 1.01;

interface Points {
  x: number;
  y: number;
}

function getDistance(p1: Points, p2: Points) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCenter(p1: Points, p2: Points) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

interface Props {
  markerMode: boolean;
  handleSetMarkerMode: (markerMode: boolean) => void;
  markerLocation: Vector2d;
  setMarkerLocation: ({ x, y }: Vector2d) => void;
  setUpdateLocation: ({ x, y }: Vector2d) => void;
  tempMarkerLocation: Vector2d;
  cancelLocation: () => void;
}

export const LocationMap = ({
  markerMode,
  handleSetMarkerMode,
  setMarkerLocation,
  markerLocation,
  setUpdateLocation,
  tempMarkerLocation,
  cancelLocation,
}: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Konva.Image | null>(null);
  const tempMarkerRef = useRef<Konva.Image | null>(null);
  const groupRef = useRef<Konva.Group>(null);
  const groupRefMain = useRef<Konva.Group>(null);
  const [mapRatio, setMapRatio] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [markerSize, setMarkerSize] = useState({ width: 0, height: 0 });
  const [pinching, setIsPinching] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // useEffect(() => {
  //   const resize = () => {
  //     var container = document.querySelector(
  //       "#stage-parent"
  //     ) as HTMLElement | null;
  //     if (container === null) return;

  //     stageRef.current?.width(container.offsetWidth || 500);

  //     setMaxHeight(container.offsetHeight || 500);

  //     setMaxWidth(container.offsetWidth || 500);
  //     stageRef.current?.height(container.offsetHeight || 600);
  //   };
  //   resize();
  //   window.addEventListener(
  //     "resize",
  //     function (e) {
  //       resize();
  //     },
  //     true
  //   );
  // }, []);
  const resize = () => {
    if (parentRef?.current && stageRef?.current) {
      const width = parentRef.current.offsetWidth;
      const height = parentRef.current.offsetHeight;
      setMaxWidth(width);
      setMaxHeight(height);
    }
  };

  useEffect(() => {
    window.addEventListener(
      "resize",
      function (e) {
        resize();
      },
      true
    );
  }, []);

  useEffect(() => {
    if (parentRef.current && stageRef.current) {
      const width = parentRef.current.offsetWidth;
      const height = parentRef.current.offsetHeight;
      setMaxWidth(width);
      setMaxHeight(height);
    }
  }, [parentRef.current?.clientWidth, parentRef.current?.clientHeight]);

  let lastCenter: Points | null = null;
  let lastDist = 0;

  function zoomStage(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();
    if (stageRef.current !== null) {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();

      const { x: pointerX, y: pointerY } =
        stage.getPointerPosition() as unknown as Vector2d;
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale,
      };
      let newScale =
        event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      if (newScale <= 1) {
        newScale = 1;
      }

      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();
    }
  }

  const setScale = (scale: number) => {
    // e.evt.preventDefault();
    const stage = stageRef.current;

    if (!stage) return;
    var oldScale = stage.scaleX();

    var center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };
    var relatedTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    var newScale = scale;
    stage.scale({
      x: newScale,
      y: newScale,
    });

    setZoomLevel(newScale);
    var newPos = {
      x: center.x - relatedTo.x * newScale,
      y: center.y - relatedTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  };

  function handleTouch(e: Konva.KonvaEventObject<TouchEvent>) {
    e.evt.preventDefault();
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];
    const stage = stageRef.current;
    if (!stage) return;
    if (touch1 && touch2) {
      setIsPinching(true);
      // if the stage was under Konva's drag&drop
      // we need to stop it, and implement our own pan logic with two pointers
      if (stage.isDragging()) {
        stage.stopDrag();
      }

      var p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      var p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!lastCenter) {
        lastCenter = getCenter(p1, p2);
        return;
      }
      var newCenter = getCenter(p1, p2);

      var dist = getDistance(p1, p2);

      if (!lastDist) {
        lastDist = dist;
      }

      // local coordinates of center point
      var pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleX(),
      };

      var scale = stage.scaleX() * (dist / lastDist);
      if (scale <= 1) {
        scale = 1;
      }
      stage.scaleX(scale);
      stage.scaleY(scale);

      // calculate new position of the stage
      var dx = newCenter.x - lastCenter.x;
      var dy = newCenter.y - lastCenter.y;

      var newPos = {
        x: newCenter.x - pointTo.x * scale + dx,
        y: newCenter.y - pointTo.y * scale + dy,
      };

      stage.position(newPos);

      lastDist = dist;
      lastCenter = newCenter;
      return;
    }
  }

  function handleTouchEnd() {
    lastCenter = null;
    lastDist = 0;
    setIsPinching(false);
    const stage = stageRef.current;
    if (stage !== null) {
      const scale = stage.scaleX();
      if (scale <= 1) {
        var newPos = {
          x: 0,
          y: 0,
        };
        stage.position(newPos);
        stage.batchDraw();
      }
    }

    // stageRef.current?.draggable(true);
  }

  function handleTouchDown(e: Konva.KonvaEventObject<TouchEvent>) {
    e.evt.preventDefault();

    if (e.evt.touches.length === 2 && stageRef.current !== null) {
      setIsPinching(true);
      // stageRef.current.draggable(false);
    }
  }

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();

    if (!stage) return;
  };

  const handleTempMarkerLocation = (x: number, y: number) => {
    setMarkerLocation({
      x: x,
      y: y,
    });
  };

  const onHandleMarkerSet = () => {
    console.log({ tempMarkerLocation });
    setUpdateLocation({
      x: tempMarkerLocation.x,
      y: tempMarkerLocation.y,
    });
  };

  return (
    <div className="p-3 w-full h-full bg-slate-300 ">
      <div
        className="w-full h-5/6 bg-slate-200 rounded-lg "
        id="stage-parent"
        ref={parentRef}
      >
        <ToolBar
          zoomIn={() => setScale(zoomLevel + 0.25)}
          zoomOut={() => {
            if (zoomLevel <= 1) {
              return;
            }
            setScale(zoomLevel - 0.25);
          }}
          zoomReset={() => {
            setScale(1);
            const stage = stageRef.current;
            if (stage === null) return;
            var newPos = {
              x: 0,
              y: 0,
            };
            stage.position(newPos);
            stage.batchDraw();
          }}
        />
        <Stage
          ref={stageRef}
          width={maxWidth}
          height={maxHeight}
          className=""
          // draggable={false}
          draggable={!pinching && !markerMode}
          onWheel={zoomStage}
          // onTap={handleOnClick}
          onTouchDown={handleTouchDown}
          onTouchMove={handleTouch}
          onTouchEnd={handleTouchEnd}
          perfectDrawEnabled={false}
          onDragStart={handleDragStart}
          // onClick={handleOnClick}
          onDragEnd={(e) => {
            if (markerMode) return;
            console.log("inside dragend stage");
            const stage = stageRef.current;
            if (stage !== null) {
              const scale = stage.scaleX();
              if (scale <= 1) {
                var newPos = {
                  x: 0,
                  y: 0,
                };
                stage.position(newPos);
                stage.batchDraw();
              }
            }
          }}
        >
          <Layer perfectDrawEnabled={false}>
            <LoadMapAndMarkers
              // url={"./assets/hospital-floor-plan.jpeg"}
              url={
                "https://tabex-logo.s3.ap-southeast-2.amazonaws.com/FLOOR-PLAN-BUILDINGS.jpg"
              }
              maxHeight={maxHeight}
              maxWidth={maxWidth}
              mapRef={mapRef}
              tempMarkerRef={tempMarkerRef}
              tempLocation={tempMarkerLocation}
              markerLocation={markerLocation}
              markerMode={markerMode}
              setTempLocation={handleTempMarkerLocation}
            />
          </Layer>
        </Stage>
        {!markerMode && (
          <div>
            <button
              onClick={() => handleSetMarkerMode(true)}
              className="bg-blue-600 border-blue-800 p-2 my-2 w-full rounded-lg text-white"
            >
              {" "}
              {!!markerLocation.x ? "Update location" : "Add marker"}
            </button>
          </div>
        )}
        {markerMode && (
          <div className="flex w-full content-center ">
            <button
              onClick={() => onHandleMarkerSet()}
              className="bg-blue-600 border-blue-800 p-2 w-full m-2 rounded-lg  text-white"
            >
              Set location
            </button>
            <button
              onClick={cancelLocation}
              className="bg-gray-600 border-gray-800 p-2 w-full m-2 rounded-lg  text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
