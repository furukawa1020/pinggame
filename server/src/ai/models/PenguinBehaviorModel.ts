import * as tf from '@tensorflow/tfjs-node';

export class PenguinBehaviorModel {
  private model: tf.LayersModel | null = null;
  private readonly inputSize = 16;
  private readonly hiddenSize = 64;
  private readonly outputSize = 4; // move, collect, socialize, rest

  async initialize(): Promise<void> {
    try {
      // Try to load existing model first
      await this.load('penguin-behavior-base');
    } catch (error) {
      console.log('Creating new neural network model...');
      await this.createModel();
    }
  }

  private async createModel(): Promise<void> {
    // Advanced neural network architecture
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.dense({
          units: this.hiddenSize,
          activation: 'relu',
          inputShape: [this.inputSize],
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 })
        }),
        
        // Dropout for regularization
        tf.layers.dropout({ rate: 0.3 }),
        
        // Hidden layer 1
        tf.layers.dense({
          units: this.hiddenSize,
          activation: 'relu',
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 })
        }),
        
        // Batch normalization
        tf.layers.batchNormalization(),
        
        // Dropout
        tf.layers.dropout({ rate: 0.2 }),
        
        // Hidden layer 2
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Output layer with softmax for action probabilities
        tf.layers.dense({
          units: this.outputSize,
          activation: 'softmax',
          kernelInitializer: 'glorotUniform'
        })
      ]
    });

    // Advanced optimizer with adaptive learning rate
    const optimizer = tf.train.adam({
      learningRate: 0.001,
      beta1: 0.9,
      beta2: 0.999,
      epsilon: 1e-8
    });

    model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    console.log('🧠 Advanced neural network model created');
    this.model.summary();
  }

  async predict(input: number[]): Promise<tf.Tensor> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const inputTensor = tf.tensor2d([input], [1, this.inputSize]);
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    
    inputTensor.dispose();
    return prediction;
  }

  async trainOnBatch(
    states: number[][],
    actions: number[],
    rewards: number[]
  ): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Convert to tensors
      const stateTensor = tf.tensor2d(states);
      
      // Create target Q-values using policy gradient approach
      const currentPredictions = this.model.predict(stateTensor) as tf.Tensor;
      const currentValues = await currentPredictions.data();
      
      // Update Q-values based on rewards
      const targets = [];
      for (let i = 0; i < states.length; i++) {
        const target = Array.from(currentValues.slice(i * 4, (i + 1) * 4));
        const action = actions[i];
        const reward = rewards[i];
        
        // Policy gradient update
        target[action] += 0.1 * reward; // Learning rate * reward
        
        // Normalize to maintain probability distribution
        const sum = target.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          for (let j = 0; j < target.length; j++) {
            target[j] = Math.max(0.01, target[j] / sum);
          }
        }
        
        targets.push(target);
      }
      
      const targetTensor = tf.tensor2d(targets);
      
      // Train the model
      await this.model.trainOnBatch(stateTensor, targetTensor);
      
      // Cleanup tensors
      stateTensor.dispose();
      targetTensor.dispose();
      currentPredictions.dispose();
      
    } catch (error) {
      console.error('Training batch failed:', error);
    }
  }

  async save(modelName: string): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      const savePath = `file://./models/${modelName}`;
      await this.model.save(savePath);
      console.log(`Model saved: ${modelName}`);
    } catch (error) {
      console.error('Model save failed:', error);
    }
  }

  async load(modelName: string): Promise<void> {
    try {
      const loadPath = `file://./models/${modelName}/model.json`;
      this.model = await tf.loadLayersModel(loadPath);
      console.log(`Model loaded: ${modelName}`);
    } catch (error) {
      console.error('Model load failed:', error);
      throw error;
    }
  }

  getModelSummary(): string {
    if (!this.model) {
      return 'Model not initialized';
    }
    
    return `
    🧠 Neural Network Architecture:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Input Layer: ${this.inputSize} neurons
    Hidden Layer 1: ${this.hiddenSize} neurons (ReLU + Dropout)
    Hidden Layer 2: ${this.hiddenSize} neurons (ReLU + BatchNorm)
    Hidden Layer 3: 32 neurons (ReLU)
    Output Layer: ${this.outputSize} neurons (Softmax)
    
    Total Parameters: ${this.model.countParams()}
    Optimizer: Adam (lr=0.001)
    Loss: Categorical Crossentropy
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}