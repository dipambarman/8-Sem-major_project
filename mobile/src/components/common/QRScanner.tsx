import React from 'react';
import { Platform, View, Text, Button } from 'react-native';

let Camera: any = null;
if (Platform.OS !== 'web') {
  // Only import if not on web to avoid bundling camera code for web
  Camera = require('expo-camera').Camera;
}

type QRScannerProps = {
  visible: boolean;
  onScan: (data: string) => void;
  onCancel: () => void;
};

export default function QRScanner({ visible, onScan, onCancel }: QRScannerProps) {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (Platform.OS !== 'web' && visible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [visible]);

  if (!visible) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>QR scanning not supported on web. Please use the app on your phone.</Text>
        <Button title="Close" onPress={onCancel} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No access to camera.</Text>
        <Button title="Close" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        onBarCodeScanned={({ data }) => {
          onScan(data);
        }}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />
      <Button title="Cancel" onPress={onCancel} />
    </View>
  );
}
