const QRCode = require('qrcode');

/**
 * Generates a Base64 encoded QR code from a given string/token
 * @param {string} data - The data to encode in the QR code
 * @returns {Promise<string>} Base64 data URI of the QR code image
 */
const generateQRCode = async (data) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        console.log('QR Code generated successfully.');
        return qrCodeDataUrl;
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw err;
    }
};

module.exports = {
    generateQRCode
};
