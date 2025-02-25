import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';



const InputFile = () => {
  const [identifier, setIdentifier] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Submitted identifier:', identifier);
  };

  const handleCancel = () => {
    setIdentifier('');
  };

  return (
    <Card className="w-full max-w-md mx-auto h-15 w-15">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          Create new input
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="identifier">Identifier</Label>
                <span 
                  className="text-gray-400 cursor-help text-sm rounded-full w-4 h-4 flex items-center justify-center border border-gray-400"
                  title="Enter a unique identifier for your input"
                >
                  i
                </span>
              </div>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full"
                placeholder="Enter identifier"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!identifier.trim()}
          >
            Create
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default InputFile;