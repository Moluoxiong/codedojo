const fs = require('fs');
const { execSync } = require('child_process');

const cppCode = process.argv[2];
if (!cppCode) {
  console.error('No C++ code provided');
  process.exit(1);
}

const inputFile = 'temp.cpp';
const outputDir = 'public/wasm';
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(inputFile, cppCode);

try {
  // 使用 emcc 编译
  execSync(`emcc ${inputFile} -o ${outputDir}/output.html \\
    -s EXPORTED_FUNCTIONS='["_main"]' \\
    -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS"]' \\
    -s ENVIRONMENT='web' \\
    -s MODULARIZE=1 \\
    -s EXPORT_NAME='createModule' \\
    -O2`, { stdio: 'inherit' });

  console.log('WASM compiled successfully!');
  console.log('Output: public/wasm/output.js and output.wasm');
} catch (err) {
  console.error('Compilation failed:', err.message);
} finally {
  fs.unlinkSync(inputFile);
}
