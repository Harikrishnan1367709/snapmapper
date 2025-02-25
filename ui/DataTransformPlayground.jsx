import React, { useState, useEffect } from 'react'
import { CodeEditor } from './CodeEditor'
import { OutputDisplay } from './OutputDisplay'
import { transformData } from '@/utils/transformer'
import { isSupabaseInitialized, loadTransformation, saveTransformation } from '@/utils/supabase'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

export function DataTransformPlayground() {
  const [inputData, setInputData] = useState('{\n  "name": "John Doe",\n  "age": 30\n}')
  const [transformLogic, setTransformLogic] = useState('// Transform the input data\nfunction transform(data) {\n  return {\n    ...data,\n    greeting: `Hello, ${data.name}!`\n  };\n}')
  const [output, setOutput] = useState('')
  const [supabaseError, setSupabaseError] = useState(null)

  useEffect(() => {
    if (!isSupabaseInitialized()) {
      setSupabaseError('Supabase is not initialized. Please check your environment variables.')
    }
  }, [])

  const handleTransform = () => {
    try {
      const result = transformData(inputData, transformLogic)
      setOutput(JSON.stringify(result, null, 2))
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    }
  }

  const handleSave = async () => {
    if (supabaseError) {
      alert(supabaseError)
      return
    }
    try {
      await saveTransformation(inputData, transformLogic)
      alert('Transformation saved successfully!')
    } catch (error) {
      alert(`Error saving transformation: ${error.message}`)
    }
  }

  const handleLoad = async () => {
    if (supabaseError) {
      alert(supabaseError)
      return
    }
    try {
      const { inputData: loadedInput, transformLogic: loadedLogic } = await loadTransformation()
      setInputData(loadedInput)
      setTransformLogic(loadedLogic)
      alert('Transformation loaded successfully!')
    } catch (error) {
      alert(`Error loading transformation: ${error.message}`)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <Tabs defaultValue="input" className="w-full">
            <TabsList>
              <TabsTrigger value="input">Input Data</TabsTrigger>
              <TabsTrigger value="transform">Transform Logic</TabsTrigger>
            </TabsList>
            <TabsContent value="input">
              <CodeEditor
                value={inputData}
                onChange={setInputData}
                language="json"
              />
            </TabsContent>
            <TabsContent value="transform">
              <CodeEditor
                value={transformLogic}
                onChange={setTransformLogic}
                language="javascript"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Output</h2>
          <OutputDisplay output={output} />
          <div className="flex justify-between mt-4">
            <Button onClick={handleTransform}>Transform</Button>
            <Button onClick={handleSave} disabled={!!supabaseError}>Save</Button>
            <Button onClick={handleLoad} disabled={!!supabaseError}>Load</Button>
          </div>
          {supabaseError && (
            <p className="text-red-500 mt-2">{supabaseError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

