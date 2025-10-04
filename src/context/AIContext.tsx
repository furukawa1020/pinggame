import React, { createContext, useContext, useState, useCallback } from 'react';

interface AIContextType {
  isAIActive: boolean;
  aiPerformance: number;
  neuralNetworkData: any[];
  trainingProgress: number;
  startAITraining: () => void;
  stopAITraining: () => void;
  updateNeuralNetwork: (data: any) => void;
  getAIDecision: (inputs: number[]) => number[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

// 軽量ニューラルネットワーククラス（フロントエンド用）
class FrontendNeuralNetwork {
  private weights: number[];
  private biases: number[];
  
  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.weights = this.initializeWeights(inputSize, hiddenSize, outputSize);
    this.biases = this.initializeBiases(hiddenSize, outputSize);
  }
  
  private initializeWeights(inputSize: number, hiddenSize: number, outputSize: number): number[] {
    const weights = [];
    // 入力→隠れ層の重み
    for (let i = 0; i < inputSize * hiddenSize; i++) {
      weights.push((Math.random() - 0.5) * 2);
    }
    // 隠れ層→出力層の重み
    for (let i = 0; i < hiddenSize * outputSize; i++) {
      weights.push((Math.random() - 0.5) * 2);
    }
    return weights;
  }
  
  private initializeBiases(hiddenSize: number, outputSize: number): number[] {
    const biases = [];
    for (let i = 0; i < hiddenSize + outputSize; i++) {
      biases.push((Math.random() - 0.5) * 0.5);
    }
    return biases;
  }
  
  forward(inputs: number[]): number[] {
    // 簡略化されたフォワードパス
    const hiddenSize = 8;
    const outputSize = 4;
    
    // 隠れ層計算
    const hidden = [];
    for (let i = 0; i < hiddenSize; i++) {
      let sum = this.biases[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += inputs[j] * this.weights[j * hiddenSize + i];
      }
      hidden.push(Math.tanh(sum));
    }
    
    // 出力層計算
    const outputs = [];
    for (let i = 0; i < outputSize; i++) {
      let sum = this.biases[hiddenSize + i];
      for (let j = 0; j < hiddenSize; j++) {
        const weightIndex = inputs.length * hiddenSize + j * outputSize + i;
        sum += hidden[j] * this.weights[weightIndex];
      }
      outputs.push(1 / (1 + Math.exp(-sum))); // シグモイド
    }
    
    return outputs;
  }
  
  updateWeights(learningData: any) {
    // 簡単な重み更新
    const learningRate = 0.01;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += (Math.random() - 0.5) * learningRate;
    }
  }
}

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAIActive, setIsAIActive] = useState(false);
  const [aiPerformance, setAiPerformance] = useState(75);
  const [neuralNetworkData, setNeuralNetworkData] = useState<any[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [neuralNet] = useState(() => new FrontendNeuralNetwork(8, 12, 4));

  const startAITraining = useCallback(() => {
    setIsAIActive(true);
    console.log('🧠 AI Training Started');
    
    // 訓練プロセスシミュレーション
    let progress = 0;
    const trainingInterval = setInterval(() => {
      progress += Math.random() * 10;
      setTrainingProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(trainingInterval);
        setAiPerformance(prev => Math.min(prev + 5, 100));
        console.log('🎯 AI Training Complete!');
      }
    }, 200);
  }, []);

  const stopAITraining = useCallback(() => {
    setIsAIActive(false);
    setTrainingProgress(0);
    console.log('⏹️ AI Training Stopped');
  }, []);

  const updateNeuralNetwork = useCallback((data: any) => {
    setNeuralNetworkData(prev => [...prev.slice(-50), data]); // 最新50件保持
    neuralNet.updateWeights(data);
    console.log('🔄 Neural Network Updated', data);
  }, [neuralNet]);

  const getAIDecision = useCallback((inputs: number[]): number[] => {
    try {
      const outputs = neuralNet.forward(inputs);
      return outputs;
    } catch (error) {
      console.error('❌ AI Decision Error:', error);
      return [0.25, 0.25, 0.25, 0.25]; // デフォルト出力
    }
  }, [neuralNet]);

  const value = {
    isAIActive,
    aiPerformance,
    neuralNetworkData,
    trainingProgress,
    startAITraining,
    stopAITraining,
    updateNeuralNetwork,
    getAIDecision
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};