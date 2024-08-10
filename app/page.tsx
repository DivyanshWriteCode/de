"use client";

import { useMutation, useStorage } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { defaultNavElement } from "@/constants";
import { handleDelete } from "@/lib/key-events";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");

  const canvasObjects = useStorage((root) => root.canvasObjects);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const activeObjectRef = useRef<fabric.Object | null>(null);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects || canvasObjects.size === 0) {
      console.error("canvasObjects is undefined or empty");
      return true;
    }

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapesFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects) {
      console.error("canvasObjects is undefined");
      return;
    }

    if (!canvasObjects.has(objectId)) {
      console.error(`Object with id ${objectId} does not exist in canvasObjects`);
      return;
    }

    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case "delete":
        handleDelete(fabricRef.current as any, deleteShapesFromStorage);
        setActiveElement(defaultNavElement);
        break;

      default:
        break;
    }

    selectedShapeRef.current = elem?.value as string;
  };

  useEffect(() => {
    // Initialize canvas and add event listeners
    const canvas = initializeFabric({ canvasRef, fabricRef });

    if (!canvas) {
      console.error("Failed to initialize canvas");
      return;
    }

    const handleMouseDown = (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    };

    const handleMouseMove = (options) => {
      if (isStorageLoaded) {
        handleCanvaseMouseMove({
          options,
          canvas,
          isDrawing,
          shapeRef,
          selectedShapeRef,
          syncShapeInStorage,
        });
      }
    };

    const handleMouseUp = () => {
      if (isStorageLoaded) {
        handleCanvasMouseUp({
          canvas,
          isDrawing,
          shapeRef,
          activeObjectRef,
          selectedShapeRef,
          syncShapeInStorage,
          setActiveElement,
        });
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    const handleResizeEvent = () => handleResize({ fabricRef });
    window.addEventListener("resize", handleResizeEvent);

    return () => {
      canvas.dispose();
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      window.removeEventListener("resize", handleResizeEvent);
    };
  }, [canvasRef]);

  // Uncomment the following useEffect hooks if needed to render the canvas
  // useEffect(() => {
  //   renderCanvas({
  //     fabricRef,
  //     canvasObjects,
  //     activeObjectRef,
  //   });
  // }, [canvasObjects]);

  // useEffect(() => {
  //   if (fabricRef.current && canvasObjects) {
  //     try {
  //       renderCanvas({
  //         fabricRef,
  //         canvasObjects,
  //         activeObjectRef,
  //       });
  //       setIsStorageLoaded(true); // Ensure storage is marked as loaded
  //     } catch (error) {
  //       console.error("Error rendering canvas:", error);
  //     }
  //   }
  // }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar />
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
    </main>
  );
}
