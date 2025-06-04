import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { Timer, CheckCircle2, ChevronDown, Play, Pause, FileDown, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TrainingStatus = 'initializing' | 'training' | 'validating' | 'finalizing' | 'completed';

// Mock training log entries
const generateLogs = () => {
  const logEntries = [
    "Loading dataset and preparing for training...",
    "Dataset loaded: 1024 examples found.",
    "Splitting into training (80%) and validation (20%)...",
    "Initializing model weights and optimizer...",
    "Starting training process...",
    "Epoch 1/3, Batch 1/128: Loss: 2.845",
    "Epoch 1/3, Batch 32/128: Loss: 2.156",
    "Epoch 1/3, Batch 64/128: Loss: 1.879",
    "Epoch 1/3, Batch 96/128: Loss: 1.642",
    "Epoch 1/3, Batch 128/128: Loss: 1.423",
    "Validation loss after epoch 1: 1.387",
    "Epoch 2/3, Batch 1/128: Loss: 1.322",
    "Epoch 2/3, Batch 32/128: Loss: 1.211",
    "Epoch 2/3, Batch 64/128: Loss: 1.109",
    "Epoch 2/3, Batch 96/128: Loss: 1.068",
    "Epoch 2/3, Batch 128/128: Loss: 0.989",
    "Validation loss after epoch 2: 0.945",
    "Epoch 3/3, Batch 1/128: Loss: 0.921",
    "Epoch 3/3, Batch 32/128: Loss: 0.879",
    "Epoch 3/3, Batch 64/128: Loss: 0.845",
    "Epoch 3/3, Batch 96/128: Loss: 0.811",
    "Epoch 3/3, Batch 128/128: Loss: 0.778",
    "Final validation loss: 0.762",
    "Training completed successfully!",
    "Optimizing model for inference...",
    "Converting to GGUF format...",
    "Fine-tuned model saved successfully.",
  ];

  return logEntries;
};

export default function TuningProgress() {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState<TrainingStatus>('initializing');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [showDetails, setShowDetails] = useState(false);
  
  const totalLogs = generateLogs();
  
  // Simulate the training process
  useEffect(() => {
    if (isPaused || currentStatus === 'completed') return;
    
    const interval = setInterval(() => {
      // Update time counters
      setTimeElapsed(prev => prev + 1);
      setTimeRemaining(prev => Math.max(0, prev - 1));
      
      if (currentLogIndex < totalLogs.length && !isPaused) {
        setLogs(prev => [...prev, totalLogs[currentLogIndex]]);
        setCurrentLogIndex(prev => prev + 1);
        
        // Update progress based on log index
        const newProgress = Math.min(100, Math.floor((currentLogIndex / totalLogs.length) * 100));
        setProgress(newProgress);
        
        // Update status based on the log content or progress
        if (newProgress < 10) {
          setCurrentStatus('initializing');
        } else if (newProgress < 80) {
          setCurrentStatus('training');
        } else if (newProgress < 90) {
          setCurrentStatus('validating');
        } else if (newProgress < 100) {
          setCurrentStatus('finalizing');
        } else {
          setCurrentStatus('completed');
          clearInterval(interval);
        }
      } else if (currentLogIndex >= totalLogs.length) {
        setProgress(100);
        setCurrentStatus('completed');
        setTimeRemaining(0);
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, currentLogIndex, currentStatus, totalLogs.length]);
  
  // Format time (seconds to mm:ss)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const getStatusVariant = (status: TrainingStatus): 'primary' | 'secondary' | 'success' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'training':
      case 'validating':
        return 'primary';
      default:
        return 'secondary';
    }
  };
  
  const getStatusLabel = (status: TrainingStatus): string => {
    switch (status) {
      case 'initializing':
        return 'Initializing';
      case 'training':
        return 'Training';
      case 'validating':
        return 'Validating';
      case 'finalizing':
        return 'Finalizing';
      case 'completed':
        return 'Completed';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fine-Tuning Progress</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor your model training in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fine-Tuning Status</CardTitle>
                <Badge variant={getStatusVariant(currentStatus)}>
                  {getStatusLabel(currentStatus)}
                </Badge>
              </div>
              <CardDescription>
                {currentStatus === 'completed'
                  ? 'Your model has been successfully fine-tuned and is ready for use'
                  : 'Your model is currently being fine-tuned'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress 
                value={progress} 
                size="lg" 
                variant={currentStatus === 'completed' ? 'success' : 'primary'}
                showValue={true}
              />
              
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Time elapsed: <span className="font-medium">{formatTime(timeElapsed)}</span>
                  </span>
                </div>
                
                {timeRemaining > 0 ? (
                  <div className="text-gray-700 dark:text-gray-300">
                    Estimated remaining: <span className="font-medium">{formatTime(timeRemaining)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  <span>{showDetails ? 'Hide' : 'Show'} training details</span>
                  <ChevronDown className={`h-4 w-4 ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 max-h-64 overflow-y-auto font-mono text-xs">
                        {logs.map((log, index) => (
                          <div key={index} className="py-1">
                            <span className="text-gray-500 dark:text-gray-400">{`[${formatTime(index * (timeElapsed / logs.length))}]`}</span>{' '}
                            <span>{log}</span>
                          </div>
                        ))}
                        {currentStatus !== 'completed' && !isPaused && (
                          <div className="py-1 animate-pulse">
                            <span className="text-gray-500 dark:text-gray-400">[{formatTime(timeElapsed)}]</span>{' '}
                            <span>_</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {currentStatus !== 'completed' && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant={isPaused ? 'primary' : 'outline'}
                    onClick={() => setIsPaused(!isPaused)}
                    leftIcon={isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  >
                    {isPaused ? 'Resume Training' : 'Pause Training'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {currentStatus === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-2">
                      <CheckCircle2 className="h-8 w-8 text-success-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-success-800 dark:text-success-300 mb-1">
                        Fine-Tuning Completed Successfully!
                      </h3>
                      <p className="text-success-700 dark:text-success-400 mb-4">
                        Your model "My-Fine-Tuned-Model" is now ready to use. You can start testing it or download it for offline usage.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="outline"
                          leftIcon={<FileDown className="h-4 w-4" />}
                        >
                          Download Model
                        </Button>
                        <Button
                          variant="outline" 
                          leftIcon={<ArrowUpRight className="h-4 w-4" />}
                        >
                          View Training Metrics
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => navigate('/query')}
                        >
                          Test Your Model
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Training Details</CardTitle>
              <CardDescription>
                Information about your fine-tuning job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-1">Model Configuration</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Base Model</p>
                    <p className="text-gray-700 dark:text-gray-300">Mistral-7B-v0.1</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Training Method</p>
                    <p className="text-gray-700 dark:text-gray-300">LoRA</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Epochs</p>
                    <p className="text-gray-700 dark:text-gray-300">3</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Batch Size</p>
                    <p className="text-gray-700 dark:text-gray-300">8</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Dataset</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Examples</p>
                    <p className="text-gray-700 dark:text-gray-300">1,024</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Size</p>
                    <p className="text-gray-700 dark:text-gray-300">2.3 MB</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Split</p>
                    <p className="text-gray-700 dark:text-gray-300">80% training, 20% validation</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Progress Metrics</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Training Loss</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentStatus === 'completed' ? '0.778' : logs.length > 12 ? '0.921' : logs.length > 6 ? '1.642' : '2.845'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Validation Loss</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentStatus === 'completed' ? '0.762' : logs.length > 16 ? '0.945' : logs.length > 10 ? '1.387' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Current Epoch</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentStatus === 'completed' ? '3/3' : logs.length > 17 ? '3/3' : logs.length > 10 ? '2/3' : logs.length > 5 ? '1/3' : '0/3'}
                    </p>
                  </div>
                </div>
              </div>
              
              {currentStatus === 'completed' && (
                <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-md text-success-800 dark:text-success-200 text-sm">
                  <p className="font-medium">Training Successfully Completed</p>
                  <p className="mt-1 text-success-700 dark:text-success-300 text-xs">
                    Final validation loss: 0.762 (40.2% improvement from base model)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}