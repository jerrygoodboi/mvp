import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display the QR code image
 * @param {string} qrCode - Base64 data URI of the QR code
 * @param {boolean} isLoading - Whether the QR code is currently loading
 */
const QRDisplay = ({ qrCode, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-2xl transition-all hover:scale-105">
      {isLoading ? (
        <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={qrCode}
            alt="QR Authentication Code"
            className="w-64 h-64 rounded-lg object-contain transition-opacity duration-300"
          />
          <div className="absolute inset-0 border-4 border-teal rounded-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </div>
      )}
      <div className="mt-4 text-center">
        <p className="text-navy font-bold text-lg">Scan to Login</p>
        <p className="text-gray-500 text-sm mt-1">Open your mobile app and scan this code</p>
      </div>
    </div>
  );
};

QRDisplay.propTypes = {
  qrCode: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
};

export default QRDisplay;
