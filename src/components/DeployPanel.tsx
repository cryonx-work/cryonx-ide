import { Rocket, Cloud, Server, Globe, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export function DeployPanel() {
  const [selectedPlatform, setSelectedPlatform] = useState('vercel');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState('ready'); // ready, deploying, success, error

  const platforms = [
    { id: 'vercel', name: 'Vercel', icon: Globe, description: 'Deploy to Vercel' },
    { id: 'netlify', name: 'Netlify', icon: Cloud, description: 'Deploy to Netlify' },
    { id: 'aws', name: 'AWS', icon: Server, description: 'Deploy to AWS' },
    { id: 'github', name: 'GitHub Pages', icon: Globe, description: 'Deploy to GitHub Pages' },
  ];

  const deploymentHistory = [
    {
      id: '1',
      platform: 'Vercel',
      status: 'success',
      timestamp: '2 hours ago',
      url: 'https://my-app-abc123.vercel.app',
      commit: 'feat: add new components'
    },
    {
      id: '2',
      platform: 'Netlify',
      status: 'success',
      timestamp: '1 day ago',
      url: 'https://amazing-app-xyz789.netlify.app',
      commit: 'fix: resolve build issues'
    },
    {
      id: '3',
      platform: 'Vercel',
      status: 'error',
      timestamp: '2 days ago',
      url: null,
      commit: 'chore: update dependencies'
    }
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployStatus('deploying');
    
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      setDeployStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDeployStatus('ready');
      }, 3000);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'deploying':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 h-full">
      <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
        Deploy
      </h3>

      {/* Platform Selection */}
      <div className="mb-6">
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Choose Platform
        </h4>
        <div className="space-y-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`w-full p-3 rounded border transition-colors text-left ${
                selectedPlatform === platform.id
                  ? 'border-purple-400 bg-purple-500/10 text-purple-400'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <platform.icon className="w-5 h-5" />
                <div>
                  <div className="font-medium">{platform.name}</div>
                  <div className="text-xs text-gray-400">{platform.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deploy Button */}
      <div className="mb-6">
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded font-medium transition-colors ${
            isDeploying
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isDeploying ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Deploying...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Deploy to {platforms.find(p => p.id === selectedPlatform)?.name}</span>
            </>
          )}
        </button>

        {/* Deploy Status */}
        {deployStatus !== 'ready' && (
          <div className={`mt-3 p-3 rounded flex items-center space-x-2 ${
            deployStatus === 'success' ? 'bg-green-500/10 border border-green-500/20' :
            deployStatus === 'deploying' ? 'bg-yellow-500/10 border border-yellow-500/20' :
            'bg-red-500/10 border border-red-500/20'
          }`}>
            {getStatusIcon(deployStatus)}
            <span className={`text-sm ${
              deployStatus === 'success' ? 'text-green-400' :
              deployStatus === 'deploying' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {deployStatus === 'success' && 'Deployment successful!'}
              {deployStatus === 'deploying' && 'Deploying your application...'}
              {deployStatus === 'error' && 'Deployment failed!'}
            </span>
          </div>
        )}
      </div>

      {/* Environment Variables */}
      <div className="mb-6">
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Environment Variables
        </h4>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Variable name"
              className="flex-1 bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value"
              className="flex-1 bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>
          <button className="text-xs text-purple-400 hover:text-purple-300">
            + Add Variable
          </button>
        </div>
      </div>

      {/* Deployment History */}
      <div>
        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Recent Deployments
        </h4>
        <div className="space-y-2">
          {deploymentHistory.map((deployment) => (
            <div key={deployment.id} className="p-3 bg-gray-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(deployment.status)}
                  <span className="text-sm text-gray-300">{deployment.platform}</span>
                </div>
                <span className="text-xs text-gray-500">{deployment.timestamp}</span>
              </div>
              
              <div className="text-xs text-gray-400 mb-1">
                {deployment.commit}
              </div>
              
              {deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 break-all"
                >
                  {deployment.url}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="space-y-2">
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded flex items-center space-x-2">
            <Settings className="w-3 h-3" />
            <span>Deployment Settings</span>
          </button>
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded flex items-center space-x-2">
            <Globe className="w-3 h-3" />
            <span>Custom Domain</span>
          </button>
        </div>
      </div>
    </div>
  );
}