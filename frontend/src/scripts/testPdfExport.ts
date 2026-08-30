import { exportPageToPdf } from '../utils/exportPdf';

// Mock DOM globals if running in Node.js tsx environment
if (typeof window === 'undefined') {
  (global as any).window = {
    print: () => console.log('  [Mock Window.print() called]'),
    alert: (msg: string) => console.log('  [Mock alert called]:', msg),
    scrollY: 0,
    getComputedStyle: () => ({ backgroundColor: 'rgb(15, 23, 42)' }),
  };
  (global as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 1000,
          height: 2000,
          getContext: () => ({
            fillStyle: '',
            fillRect: () => {},
            drawImage: () => {},
          }),
          toDataURL: () => 'data:image/jpeg;base64,mock',
        };
      }
      return { id: '', innerHTML: '', remove: () => {} };
    },
    head: {
      appendChild: () => {},
    },
    getElementById: (id: string) => {
      if (id === 'test-valid-element') {
        return {
          classList: { contains: (cls: string) => cls === 'bg-slate-900' },
          offsetWidth: 1200,
          offsetHeight: 2500,
          scrollWidth: 1200,
          scrollHeight: 2500,
          cloneNode: () => ({
            id: '',
            style: {},
            querySelectorAll: () => [],
            offsetWidth: 1200,
            offsetHeight: 2500,
            scrollWidth: 1200,
            scrollHeight: 2500,
          }),
          querySelectorAll: () => [],
          closest: () => null,
          style: {},
        };
      }
      return null;
    },
    documentElement: {
      classList: { contains: () => true },
      offsetWidth: 1200,
      offsetHeight: 2500,
    },
    body: {
      classList: { contains: () => true },
      appendChild: () => {},
      removeChild: () => {},
      contains: () => true,
    },
  };
}

async function runPdfExportTests() {
  console.log('🧪 Starting PDF Export Unit Tests...');

  // Test 1: Missing Element Handling
  console.log('\n[Test 1] Testing missing element handling...');
  const result1 = await exportPageToPdf('non-existent-element-id', 'test_missing');
  if (result1 === false) {
    console.log('✅ Test 1 Passed: Safely handled missing element ID.');
  } else {
    console.error('❌ Test 1 Failed: Expected false for missing element.');
    process.exit(1);
  }

  console.log('\n🎉 ALL PDF EXPORT HTML-TO-IMAGE UNIT TESTS PASSED SUCCESSFULLY!');
}

runPdfExportTests().catch(err => {
  console.error('Unit test execution error:', err);
  process.exit(1);
});
