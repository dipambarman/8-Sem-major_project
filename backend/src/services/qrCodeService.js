import QRCode from 'qrcode';

class QRCodeService {
  // Generate QR code data URL for order
  async generateOrderQR(orderId, orderNumber) {
    try {
      const qrData = JSON.stringify({
        type: 'order',
        orderId,
        orderNumber,
        timestamp: new Date().toISOString()
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code for coupon/discount
  async generateCouponQR(couponId, discountValue, expiryDate) {
    try {
      const qrData = JSON.stringify({
        type: 'coupon',
        couponId,
        discountValue,
        expiryDate,
        timestamp: new Date().toISOString()
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Coupon QR Code generation error:', error);
      throw new Error('Failed to generate coupon QR code');
    }
  }

  // Validate QR code data
  validateQRData(qrString) {
    try {
      const data = JSON.parse(qrString);

      if (!data.type || !data.timestamp) {
        return { valid: false, error: 'Invalid QR code format' };
      }

      // Check if QR code is expired (24 hours)
      const qrTimestamp = new Date(data.timestamp);
      const now = new Date();
      const hoursDiff = (now - qrTimestamp) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return { valid: false, error: 'QR code expired' };
      }

      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  // Generate QR code as buffer (for file storage)
  async generateOrderQRBuffer(orderId, orderNumber) {
    try {
      const qrData = JSON.stringify({
        type: 'order',
        orderId,
        orderNumber,
        timestamp: new Date().toISOString()
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeBuffer;
    } catch (error) {
      console.error('QR Code buffer generation error:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }
}

export default new QRCodeService();
