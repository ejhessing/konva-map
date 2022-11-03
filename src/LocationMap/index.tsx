import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { useEffect, useRef, useState } from "react";
import { Group, Layer, Stage } from "react-konva";
import { ToolBar } from "../Toolbar";
import { LoadMap } from "./LoadMap";
import { Marker } from "./Marker";
import { MarkerImage } from "./MarkerImage";

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

// function isTouchEnabled() {
//   return (
//     "ontouchstart" in window ||
//     navigator.maxTouchPoints > 0 ||
//     navigator.maxTouchPoints > 0
//   );
// }

interface Props {
  markerMode: boolean;
  setMarkerMode: (markerMode: boolean) => void;
  markerLocation: Vector2d;
  setMarkerLocation: ({ x, y }: Vector2d) => void;
}

export const LocationMap = ({
  markerMode,
  setMarkerMode,
  setMarkerLocation,
  markerLocation,
}: Props) => {
  const stageRef = useRef<Konva.Stage>(null);
  const mapRef = useRef<Konva.Image | null>(null);
  const markerRef = useRef<Konva.Image | null>(null);
  const markerImageRef = useRef<Konva.Image | null>(null);
  const [mapRatio, setMapRatio] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  const [pinching, setIsPinching] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

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

  const onHandleMarkerSet = () => {
    if (
      markerRef.current === null ||
      stageRef.current === null ||
      mapRef.current === null
    )
      return;

    var transform = stageRef.current.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();
    // now we find relative point
    const pos = markerRef.current.getClientRect();
    // Location of the absolute point of marker
    var point = transform.point(pos);

    const mapPos = mapRef.current.getClientRect();
    // Location of absolute position of where the map starts
    var mapPoint = transform.point(mapPos);

    // make the points start at (0,0) by removing where the map starts
    // divide it by the width and height to make it a percentage

    const originalMapSize = {
      width: mapSize.width / mapRatio,
      height: mapSize.height / mapRatio,
    };
    console.log({
      x: ((point.x - mapPoint.x) / mapSize.width) * originalMapSize.width,
      y: ((point.y - mapPoint.y) / mapSize.height) * originalMapSize.height,
    });
    setMarkerLocation({
      x: ((point.x - mapPoint.x) / mapSize.width) * originalMapSize.width,
      y: ((point.y - mapPoint.y) / mapSize.height) * originalMapSize.height,
    });
  };

  return (
    <div className="p-3 w-full h-full bg-slate-300 ">
      <div className="w-full h-5/6 bg-slate-200 rounded-lg " id="stage-parent">
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
          width={500}
          height={500}
          className=""
          // draggable={false}
          draggable={!pinching && !markerMode}
          onWheel={zoomStage}
          onTouchDown={handleTouchDown}
          onTouchMove={handleTouch}
          onTouchEnd={handleTouchEnd}
          perfectDrawEnabled={false}
          onDragStart={handleDragStart}
          onDragEnd={(e) => {
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
            <Group>
              <LoadMap
                url={"./assets/hospital-floor-plan.jpg"}
                mapHeight={maxHeight}
                mapWidth={maxWidth}
                mapRef={mapRef}
                setMapSize={(w: number, h: number) =>
                  setMapSize({ width: w, height: h })
                }
                setMapRatio={(x: number) => setMapRatio(x)}
              />
              {!!markerLocation.x && (
                <MarkerImage
                  url={"./assets/marker.png"}
                  maxWidth={maxWidth}
                  maxHeight={maxHeight}
                  markerRef={markerImageRef}
                  location={markerLocation}
                  mapSize={mapSize}
                  mapRef={mapRef}
                  stageRef={stageRef}
                  mapRatio={mapRatio}
                />
              )}
            </Group>
          </Layer>
          {markerMode && (
            <Layer draggable>
              <Group>
                <Marker
                  url={"./assets/temp-marker.png"}
                  maxWidth={maxWidth}
                  maxHeight={maxHeight}
                  markerRef={markerRef}
                  location={markerLocation}
                  mapSize={mapSize}
                  mapRef={mapRef}
                  stageRef={stageRef}
                  mapRatio={mapRatio}
                />
              </Group>
            </Layer>
          )}
        </Stage>
        {!markerMode && (
          <div>
            <button
              onClick={() => setMarkerMode(true)}
              className="bg-blue-600 border-blue-800 p-2 my-2 w-full rounded-lg text-white"
            >
              {" "}
              Add Marker
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
              onClick={() => setMarkerMode(false)}
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
