const express = require('express')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.text({ type: 'text/cpp', limit: '10mb' }))

app.post('/compile', (req, res) => {
  const code = req.body
  
  // Define paths at the top
  const inputPath = path.join(__dirname, 'input.cpp')
  const outputPath = path.join(__dirname, 'output.js')

  // Clean old files
  try {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  } catch (e) {
    console.error('Cleanup error:', e)
  }

  // Write user code
  fs.writeFileSync(inputPath, code)

  // Compile command
  const cmd = `emcc ${inputPath} -o ${outputPath} ` +
    `-s EXPORTED_FUNCTIONS='["_main"]' ` +
    `-s EXPORTED_RUNTIME_METHODS='["FS"]' ` +
    `-s ENVIRONMENT=web -O2 -s SINGLE_FILE=1 ` +
    `-s MODULARIZE=1 -s EXPORT_NAME='createCppModule'`

  exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('Compilation error:', err)
      return res.status(500).json({ error: 'Compilation timeout or failed' })
    }
    
    if (stderr && stderr.includes('error:')) {
      console.error('emcc stderr:', stderr)
      return res.status(400).json({ error: stderr })
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'Output file not generated' })
    }

    const js = fs.readFileSync(outputPath, 'utf8')
    res.json({ js })
  })
})

app.listen(4000, () => {
  console.log('✓ Compiler server running on http://localhost:4000')
})
