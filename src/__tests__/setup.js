import '@testing-library/jest-dom';

// Stub browser APIs unavailable in jsdom
Object.defineProperty(navigator, 'vibrate', { value: () => {}, writable: true });
Object.defineProperty(window, '_swReg', { value: null, writable: true });
