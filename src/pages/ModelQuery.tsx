import { useState, useRef, useEffect } from 'react';
import { ArrowRight, CornerDownLeft, Copy, CheckCheck, MessageSquare, Scale, Send, DownloadCloud } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { ModelInfo } from '../components/models/ModelCard';

// Mock data
const availableModels: ModelInfo[] = [
  {
    id: 'mistral-7b-v0.1-custom',
    name: 'Mistral-7B-Instruct-v0.1-custom',
    description: 'Fine-tuned Mistral model for customer support responses',
    size: '7B',
    architecture: 'Mistral',
    creationDate: 'Apr 12, 2025',
    isBase: false,
    baseModelId: 'mistral-7b-v0.1'
  },
  {
    id: 'mistral-7b-v0.1',
    name: 'Mistral-7B-v0.1',
    description: 'Base Mistral model',
    size: '7B',
    architecture: 'Mistral',
    isBase: true
  },
  {
    id: 'tinyllama-1.1b-v0.6-fine-tuned',
    name: 'TinyLlama-1.1B-v0.6-fine-tuned',
    description: 'Code completion assistant based on TinyLlama',
    size: '1.1B',
    architecture: 'TinyLlama',
    creationDate: 'Apr 5, 2025',
    isBase: false,
    baseModelId: 'tinyllama-1.1b'
  },
  {
    id: 'phi-2-medical-assistant',
    name: 'Phi-2-medical-assistant',
    description: 'Medical domain specialized Phi-2 model',
    size: '2.7B',
    architecture: 'Phi',
    creationDate: 'Mar 28, 2025',
    isBase: false,
    baseModelId: 'phi-2'
  }
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

export default function ModelQuery() {
  const [selectedModelId, setSelectedModelId] = useState('mistral-7b-v0.1-custom');
  const [compareModelId, setCompareModelId] = useState('mistral-7b-v0.1');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({});
  
  // Get selected model info
  const selectedModel = availableModels.find(m => m.id === selectedModelId);
  const compareModel = availableModels.find(m => m.id === compareModelId);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    
    // Generate responses for both models
    await generateResponse(selectedModelId, inputValue);
    if (showCompare) {
      await generateResponse(compareModelId, inputValue, 50); // Slight delay for the comparison model
    }
    
    setIsGenerating(false);
  };

  const generateResponse = async (modelId: string, prompt: string, delay = 0) => {
    // Find the model name
    const model = availableModels.find(m => m.id === modelId);
    if (!model) return;
    
    // Mock responses based on model
    const responses: {[key: string]: string} = {
      'mistral-7b-v0.1-custom': "Based on my customer service training, I understand your concerns about the delayed shipment. I'd be happy to help resolve this issue for you. First, let me check the status of your order in our system. I can see it's currently in transit but was delayed due to weather conditions affecting our logistics partner. I've expedited your shipment and added a 15% discount to your account for the inconvenience. You should receive your package within 2 business days. Please let me know if you have any other questions!",
      'mistral-7b-v0.1': "I will look into the status of your order. The shipment appears to be delayed. This could be due to various factors including weather, logistics issues, or processing delays. I recommend contacting the shipping company directly for more specific information about your package location and expected delivery timeframe. You might also want to check if there's a tracking number available to monitor the progress of your delivery.",
      'tinyllama-1.1b-v0.6-fine-tuned': "function checkShipmentStatus(orderId) {\n  return fetch(`/api/orders/${orderId}`)\n    .then(response => response.json())\n    .then(data => {\n      if (data.status === 'delayed') {\n        return notifyCustomer(data.customerId, 'delay');\n      }\n      return data;\n    })\n    .catch(error => console.error('Error checking shipment:', error));\n}",
      'phi-2-medical-assistant': "From a medical perspective, stress from waiting for delayed packages can actually impact your wellbeing. I recommend practicing patience and using this time productively. The shipment delay could be due to many logistical factors outside anyone's control. If you need the items urgently for health reasons, I suggest exploring local alternatives while waiting. Remember that package tracking systems are usually accurate, and your items are likely still en route."
    };
    
    let response = responses[modelId];
    if (!response) {
      response = "I'm analyzing your question about the delayed shipment. The estimated delivery time may have been affected by processing factors or transportation issues. I'd recommend checking the tracking information for the most up-to-date status on your package.";
    }
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Start with empty response that grows character by character
    let partialResponse = '';
    const newMessage: ChatMessage = { 
      role: 'assistant', 
      content: partialResponse,
      model: model.name
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate typing
    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 10));
      partialResponse += response.charAt(i);
      
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, content: partialResponse } : msg
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, messageIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopySuccess({...copySuccess, [messageIndex]: true});
    setTimeout(() => {
      setCopySuccess({...copySuccess, [messageIndex]: false});
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Query Models</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Test and compare your fine-tuned models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Models</CardTitle>
              <CardDescription>
                Choose which models to query
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Primary Model
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="compareMode"
                  checked={showCompare}
                  onChange={() => setShowCompare(!showCompare)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="compareMode" className="text-sm">
                  Compare with base model
                </label>
              </div>
              
              {showCompare && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-1">
                      Comparison Model
                    </label>
                    <select
                      value={compareModelId}
                      onChange={(e) => setCompareModelId(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {availableModels
                        .filter((model) => model.id !== selectedModelId)
                        .map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </motion.div>
              )}

              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3">Parameters</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="temperature" className="text-xs font-medium">
                        Temperature
                      </label>
                      <span className="text-xs">0.7</span>
                    </div>
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="0.7"
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="maxTokens" className="text-xs font-medium">
                        Max Tokens
                      </label>
                      <span className="text-xs">256</span>
                    </div>
                    <input
                      type="range"
                      id="maxTokens"
                      min="32"
                      max="2048"
                      step="32"
                      defaultValue="256"
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="topP" className="text-xs font-medium">
                        Top P
                      </label>
                      <span className="text-xs">0.95</span>
                    </div>
                    <input
                      type="range"
                      id="topP"
                      min="0.1"
                      max="1"
                      step="0.05"
                      defaultValue="0.95"
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t flex-col space-y-3 items-start">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Selected Model Info</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>Size: <span className="text-gray-700 dark:text-gray-300">{selectedModel?.size}</span></div>
                  <div>Type: <span className="text-gray-700 dark:text-gray-300">{selectedModel?.isBase ? 'Base' : 'Fine-tuned'}</span></div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<DownloadCloud className="h-4 w-4" />}
                className="w-full"
              >
                Download Model
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-3 h-full flex flex-col">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-primary-500" />
                <div>
                  <CardTitle>Model Chat</CardTitle>
                  <CardDescription>
                    {showCompare ? 'Compare responses from different models' : 'Test your selected model'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-4">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-1">No messages yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                      Send a message to start chatting with the selected model
                    </p>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                      <Button
                        variant="outline" 
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => setInputValue("What's the difference between fine-tuning and prompt engineering?")}
                      >
                        Explain fine-tuning vs prompt engineering
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => setInputValue("My shipment is delayed. Can you help me?")}
                      >
                        Help with a delayed shipment
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => setInputValue("Write a function to check order status")}
                      >
                        Generate a status-checking function
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => setInputValue("Summarize the key benefits of small LLMs")}
                      >
                        Summarize small LLM benefits
                      </Button>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className="flex flex-col">
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                          inline-block rounded-lg px-4 py-2 max-w-[85%] md:max-w-[75%] break-words
                          ${message.role === 'user' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}
                        `}>
                          {message.role === 'assistant' && message.model && (
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant={message.model.includes('fine-tuned') || !message.model.includes('v0.1') ? 'secondary' : 'outline'} size="sm">
                                {message.model}
                              </Badge>
                              <button
                                onClick={() => copyToClipboard(message.content, index)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label="Copy text"
                              >
                                {copySuccess[index] ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                          <div className="text-sm whitespace-pre-line">
                            {message.content}
                          </div>
                        </div>
                      </div>

                      {message.role === 'assistant' && showCompare && message.model === compareModel?.name && (
                        <div className="mt-2 flex justify-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800/50 rounded-full">
                            <Scale className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Compare the responses above</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="w-full relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
                <Button
                  variant="primary"
                  size="icon"
                  disabled={!inputValue.trim() || isGenerating}
                  isLoading={isGenerating}
                  onClick={handleSendMessage}
                  className="absolute bottom-3 right-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}