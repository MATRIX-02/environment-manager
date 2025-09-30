import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Plus, Trash2, FileUp, Sparkles } from 'lucide-react';
import { EnvVar } from '@/types';

interface EnvironmentVariablesProps {
  repoName: string;
  envVars: EnvVar[];
  onAddEnvVar: (repoName: string, envVar: EnvVar) => void;
  onRemoveEnvVar: (repoName: string, index: number) => void;
  onParseBulkEnvVars: (repoName: string, envText: string) => void;
}

export const EnvironmentVariables: React.FC<EnvironmentVariablesProps> = ({
  repoName,
  envVars,
  onAddEnvVar,
  onRemoveEnvVar,
  onParseBulkEnvVars,
}) => {
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [bulkEnvText, setBulkEnvText] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const handleAddEnvVar = () => {
    if (!newVarName.trim()) {
      alert('Please enter variable name');
      return;
    }

    onAddEnvVar(repoName, {
      name: newVarName.trim(),
      value: newVarValue.trim(),
    });

    setNewVarName('');
    setNewVarValue('');
  };

  const handleBulkImport = () => {
    if (!bulkEnvText.trim()) return;

    onParseBulkEnvVars(repoName, bulkEnvText);
    setBulkEnvText('');
    setIsBulkModalOpen(false);
  };

  const handleCopyAll = () => {
    if (envVars.length === 0) {
      alert('No environment variables to copy');
      return;
    }

    const envText = envVars.map(v => `${v.name}=${v.value}`).join('\n');

    navigator.clipboard.writeText(envText)
      .then(() => {
        alert('Environment variables copied to clipboard!');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = envText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Environment variables copied to clipboard!');
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Environment Variables ({envVars.length})
          </h3>
          <p className="text-gray-600 mt-1">Manage your environment configuration</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700">
                <FileUp className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileUp className="w-5 h-5" />
                  Bulk Import Environment Variables
                </DialogTitle>
                <DialogDescription>
                  Paste your .env file content here. Each line should be in the format: VARIABLE_NAME=value
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkEnv">Environment Variables</Label>
                  <Textarea
                    id="bulkEnv"
                    value={bulkEnvText}
                    onChange={(e) => setBulkEnvText(e.target.value)}
                    placeholder={`NODE_ENV=development\nAPI_KEY=your_api_key\nDATABASE_URL=your_db_url\nPORT=3000`}
                    className="min-h-[200px] font-mono text-sm mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={!bulkEnvText.trim()}>
                  Import Variables
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {envVars.length > 0 && (
            <Button variant="outline" onClick={handleCopyAll}>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          )}
        </div>
      </div>

      {/* Add New Variable */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-4">Add New Variable</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="varName" className="text-sm font-medium text-gray-700">Variable Name</Label>
            <Input
              id="varName"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder="VARIABLE_NAME"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="varValue" className="text-sm font-medium text-gray-700">Value</Label>
            <Input
              id="varValue"
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              placeholder="variable_value"
              className="mt-1"
            />
          </div>
          <Button onClick={handleAddEnvVar} disabled={!newVarName.trim()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </div>
      </div>

      {/* Variables List */}
      {envVars.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No environment variables yet</h3>
          <p className="text-gray-500">Add your first environment variable to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">Environment Variables Preview</span>
              <span className="text-gray-400 text-xs">.env format</span>
            </div>
            <pre className="p-4 text-green-400 text-sm overflow-x-auto">
              {envVars.map(v => `${v.name}=${v.value}`).join('\n')}
            </pre>
          </div>

          <div className="space-y-2">
            {envVars.map((envVar, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm">
                    <span className="font-semibold text-blue-600">{envVar.name}</span>
                    <span className="text-gray-400 mx-2">=</span>
                    <span className="text-gray-700">{envVar.value}</span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveEnvVar(repoName, index)}
                  className="ml-3 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};