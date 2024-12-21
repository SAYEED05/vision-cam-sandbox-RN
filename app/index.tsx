import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState, useRef } from "react";
import {
  Camera,
  runAsync,
  useCameraDevice,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import {
  Face,
  useFaceDetector,
  FaceDetectionOptions,
  Contours,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import { Skia, TileMode, ClipOp } from "@shopify/react-native-skia";

export default function App() {
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: "fast",
    contourMode: "all",
    landmarkMode: "none",
    classificationMode: "none",
  }).current;

  const device = useCameraDevice("front");
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log({ status });
    })();
  }, [device]);

  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
    console.log("faces detected", faces);
  });

  const blurRadius = 25;
  const blurFilter = Skia.ImageFilter.MakeBlur(
    blurRadius,
    blurRadius,
    TileMode.Repeat,
    null
  );
  const paint = Skia.Paint();
  paint.setImageFilter(blurFilter);

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      // 1. Render frame as it is
      frame.render();

      // 2. Detect faces in frame
      const faces = detectFaces(frame);

      // 3. Draw a blur mask over each face
      for (const face of faces) {
        const path = Skia.Path.Make();

        const necessaryContours: (keyof Contours)[] = [
          "FACE",
          "LEFT_CHEEK",
          "RIGHT_CHEEK",
        ];
        for (const key of necessaryContours) {
          const points = face.contours[key];
          points.forEach((point: any, index: number) => {
            if (index === 0) {
              // it's a starting point
              path.moveTo(point.x, point.y);
            } else {
              // it's a continuation
              path.lineTo(point.x, point.y);
            }
          });
          path.close();
        }

        frame.save();
        frame.clipPath(path, ClipOp.Intersect, true);
        frame.render(paint);
        frame.restore();
      }
    },
    [paint, detectFaces]
  );

  return (
    <View style={{ flex: 1 }}>
      {!!device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  );
}
