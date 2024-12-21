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
    }
  }, [hasPermission]);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`);
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
