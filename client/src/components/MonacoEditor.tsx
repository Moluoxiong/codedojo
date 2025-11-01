import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'

interface Props {
  value?: string
  onChange?: (value: string) => void
  language?: string
  height?: string
}

export default function MonacoEditor({ 
  value = '', 
  onChange, 
  language = 'cpp',
  height = '500px'
}: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (divRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(divRef.current, {
        value,
        language,
        theme: 'vs-dark',
        fontSize: 16,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: 'on',
        roundedSelection: false,
        padding: { top: 16 },
        cursorBlinking: 'smooth',
      })

      editorRef.current.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() ?? '')
      })
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value)
    }
  }, [value])

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-900">
      <div ref={divRef} style={{ height }} />
    </div>
  )
}
