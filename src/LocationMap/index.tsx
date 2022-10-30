import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { LoadMap } from "./LoadMap";

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

export const LocationMap = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const mapRef = useRef<Konva.Image | null>(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [pinching, setIsPinching] = useState(false);
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

  function handleTouch(e: Konva.KonvaEventObject<TouchEvent>) {
    e.evt.preventDefault();
    console.log("touch");
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];
    const stage = stageRef.current;
    if (stage !== null) {
      if (touch1 && touch2) {
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
        if (scale < 1) {
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

        // TODO: check if this is right on mobile
        if (stage.scaleX() <= 1) {
          newPos = {
            x: lastCenter.x,
            y: lastCenter.y,
          };
        }

        stage.position(newPos);
        stage.batchDraw();

        lastDist = dist;
        lastCenter = newCenter;
      }
      // if (touch2 === undefined) {
      //   e.evt.preventDefault();
      //   const touch = e.evt.touches[0];

      //   stage.position({
      //     x: touch.clientX - stage.x() - stage.scaleX(),
      //     y: touch.clientY - stage.y() - stage.scaleY(),
      //   });
      //   stage.batchDraw();
      // }
    }
  }

  function handleTouchEnd() {
    lastCenter = null;
    lastDist = 0;
    setIsPinching(false);
  }

  function handleTouchDown(e: Konva.KonvaEventObject<TouchEvent>) {
    e.evt.preventDefault();
    if (e.evt.touches.length === 2) {
      setIsPinching(true);
    }
  }

  console.log({ maxWidth, maxHeight });
  console.log(
    "1",
    (stageRef?.current?.scaleX() || 0) > 1,
    stageRef?.current?.scaleX()
  );
  return (
    <div className="p-3">
      <div className="w-full h-5/6" id="stage-parent">
        <Stage
          ref={stageRef}
          width={500}
          height={500}
          className="bg-slate-200 border-2 border-blue-600"
          draggable={!pinching}
          // draggable={!pinching && (stageRef?.current?.scaleX() || 0) > 1}
          onWheel={zoomStage}
          onTouchDown={handleTouchDown}
          onTouchMove={handleTouch}
          onTouchEnd={handleTouchEnd}
          perfectDrawEnabled={false}
          onDragEnd={(e) => {
            const stage = stageRef.current;
            if (stage !== null) {
              const scale = stage.scaleX();
              if (scale <= 1) {
                stage.position({
                  x: 0,
                  y: 0,
                });
              }
            }
          }}
        >
          <Layer perfectDrawEnabled={false}>
            <LoadMap
              url={
                "https://tabex-logo.s3.ap-southeast-2.amazonaws.com/FLOOR-PLAN-BUILDINGS.jpg"
              }
              mapHeight={maxHeight}
              mapWidth={maxWidth}
              mapRef={mapRef}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
