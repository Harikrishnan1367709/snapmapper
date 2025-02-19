import React from 'react';
// import { Button, Tabs, TabList, TabTrigger, TabContent, Textarea, Card, CardHeader, CardContent } from "/components/ui";
import './App.css';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent, CardHeader } from './components/ui/card';




function SnaplogicPlayground1() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">SnapLogic Playground</h1>
        <nav className="flex space-x-4">
          <Button variant="ghost" className="text-white">Playground</Button>
          <Button variant="ghost" className="text-white">Docs</Button>
          <Button variant="ghost" className="text-white">Tutorial</Button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="main-content flex flex-col p-6 gap-4">
        {/* Tabs for Navigation */}
        <Tabs>
          <TabsList className="flex space-x-4 border-b">
            <TabsTrigger className="px-4 py-2 font-medium text-blue-600 border-b-2 border-transparent hover:border-blue-600 focus:outline-none">Input</TabsTrigger>
            <TabsTrigger className="px-4 py-2 font-medium text-blue-600 border-b-2 border-transparent hover:border-blue-600 focus:outline-none">Script</TabsTrigger>
            <TabsTrigger className="px-4 py-2 font-medium text-blue-600 border-b-2 border-transparent hover:border-blue-600 focus:outline-none">Output</TabsTrigger>
          </TabsList>

          <div className="tabs-content mt-4">
            {/* Input Tab */}
            <TabsContent>
              <Card className="h-96 shadow-lg">
                <CardHeader className="text-lg font-semibold">Input</CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter JSON, XML, or CSV..."
                    className="textarea h-full w-full border-gray-300"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Script Tab */}
            <TabsContent>
              <Card className="h-96 shadow-lg">
                <CardHeader className="text-lg font-semibold">Script</CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your transformation script here..."
                    className="textarea h-full w-full border-gray-300"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Output Tab */}
            <TabsContent>
              <Card className="h-96 shadow-lg">
                <CardHeader className="text-lg font-semibold">Output</CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Transformed output will appear here..."
                    readOnly
                    className="textarea h-full w-full border-gray-300"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="footer bg-gray-100 text-center py-4 mt-auto">
        <p className="text-gray-600">© 2025 SnapLogic Playground - All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default SnaplogicPlayground1;