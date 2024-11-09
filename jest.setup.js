import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock window.ethereum
global.window = {
  ethereum: {
    isMetaMask: true,
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
};

// Mock console.error to keep test output clean
global.console.error = jest.fn();

// Mock File and FileReader
global.File = class {
  constructor(bits: any[], name: string, options?: FilePropertyBag) {
    return new Blob(bits, options) as any;
  }
};

global.FileReader = class {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsArrayBuffer(blob: Blob) {
    if (this.onload) {
      this.result = new ArrayBuffer(blob.size);
      this.onload({ target: this } as any);
    }
  }
}; 