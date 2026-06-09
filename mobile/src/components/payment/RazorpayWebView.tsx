import React from 'react';
import { Modal, StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface RazorpayWebViewProps {
  visible: boolean;
  options: any;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

const RazorpayWebView: React.FC<RazorpayWebViewProps> = ({
  visible,
  options,
  onSuccess,
  onError,
  onClose,
}) => {
  if (!visible) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: rgba(0,0,0,0.5); }
        </style>
      </head>
      <body>
        <script>
          const options = ${JSON.stringify(options)};
          
          options.handler = function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', data: response }));
          };
          
          options.modal = {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
            }
          };

          const rzp = new Razorpay(options);
          
          rzp.on('payment.failed', function (response){
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: response.error }));
          });

          rzp.open();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const result = JSON.parse(event.nativeEvent.data);
      if (result.type === 'success') {
        onSuccess(result.data);
      } else if (result.type === 'error') {
        onError(result.data);
      } else if (result.type === 'dismiss') {
        onClose();
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
      onError(error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            )}
            style={styles.webview}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default RazorpayWebView;
