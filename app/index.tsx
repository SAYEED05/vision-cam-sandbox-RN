import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";

export default function Index() {
  const device = useCameraDevice("back");
  const { hasPermission } = useCameraPermission();
  const [showCamera, setShowCamera] = useState(false);

  const requestPermission = async () => {
    if (hasPermission) {
      setShowCamera(true);
    } else {
      const permissionResult = await Camera.requestCameraPermission();
      if (permissionResult) {
        // Permission granted
        setShowCamera(true);
      }
    }
  };

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    } else {
      setShowCamera(true);
    }
  }, [hasPermission]);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    console.log("called");
    console.log(frame, "frame");
    if (frame.pixelFormat === "rgb") {
      const buffer = frame.toArrayBuffer();
      const data = new Uint8Array(buffer);
      console.log(`Pixel at 0,0: RGB(${data[0]}, ${data[1]}, ${data[2]})`);
    } else if (frame.pixelFormat === "yuv") {
      const buffer = frame.toArrayBuffer();
      const data = new Uint8Array(buffer);
      console.log(`Pixel at 0,0: YUV(${data[0]}, ${data[1]}, ${data[2]})`);
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {device && hasPermission && showCamera && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      )}
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
