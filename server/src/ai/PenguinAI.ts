import * as tf from '@tensorflow/tfjs-node';
import { PenguinBehaviorModel } from './models/PenguinBehaviorModel';
import { EnvironmentProcessor } from './processors/EnvironmentProcessor';
import { RewardCalculator } from './processors/RewardCalculator';

export interface PenguinState {
  id: string;
  position: { x: number; y: number };
  happiness: number;
  energy: number;
  currentAction: string;
  memory: number[];
  performance: {
    fishCollected: number;
    yarnCollected: number;
    socialInteractions: number;
    efficiency: number;
  };
}

export interface Decision {
  action: 'move' | 'collect' | 'socialize' | 'rest';
  target?: { x: number; y: number };
  confidence: number;
  reasoning: string;
  reward?: number;
}

export class PenguinAI {
  private model: PenguinBehaviorModel;
  private environmentProcessor: EnvironmentProcessor;
  private rewardCalculator: RewardCalculator;
  private penguinId: string;
  private state: PenguinState;
  private experienceBuffer: Array<{
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
  }>;

  constructor(penguinId: string) {
    this.penguinId = penguinId;
    this.model = new PenguinBehaviorModel();
    this.environmentProcessor = new EnvironmentProcessor();
    this.rewardCalculator = new RewardCalculator();
    this.experienceBuffer = [];
    
    this.state = {
      id: penguinId,
      position: { x: 0, y: 0 },
      happiness: 50,
      energy: 100,
      currentAction: 'idle',
      memory: new Array(16).fill(0),
      performance: {
        fishCollected: 0,
        yarnCollected: 0,
        socialInteractions: 0,
        efficiency: 0
      }
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.model.initialize();
      console.log(`🧠 AI initialized for penguin ${this.penguinId}`);
    } catch (error) {
      console.error('AI initialization failed:', error);
      throw error;
    }
  }

  async makeDecision(environmentData?: any): Promise<Decision> {
    try {
      // Process environment into neural network input
      const processedEnvironment = this.environmentProcessor.process(environmentData);
      const stateVector = this.createStateVector(processedEnvironment);
      
      // Get prediction from neural network
      const prediction = await this.model.predict(stateVector);
      const actionIndex = await this.selectAction(prediction);
      
      // Convert to meaningful decision
      const decision = this.interpretAction(actionIndex, prediction);
      
      // Store experience for learning
      this.storeExperience(stateVector, actionIndex);
      
      // Update internal state
      this.updateInternalState(decision);
      
      return decision;
    } catch (error) {
      console.error('Decision making failed:', error);
      return this.getDefaultDecision();
    }
  }

  private createStateVector(environmentData: any): number[] {
    return [
      // Position (normalized)
      this.state.position.x / 1000,
      this.state.position.y / 1000,
      
      // Internal state
      this.state.happiness / 100,
      this.state.energy / 100,
      
      // Environment factors
      environmentData.nearestFishDistance || 1,
      environmentData.nearestYarnDistance || 1,
      environmentData.nearestPenguinDistance || 1,
      environmentData.crowdDensity || 0,
      
      // Performance metrics
      this.state.performance.efficiency,
      this.state.performance.fishCollected / 100,
      this.state.performance.yarnCollected / 100,
      this.state.performance.socialInteractions / 100,
      
      // Memory (short-term patterns)
      ...this.state.memory.slice(0, 4)
    ];
  }

  private async selectAction(prediction: tf.Tensor): Promise<number> {
    const probabilities = await prediction.data();
    
    // ε-greedy action selection with adaptive exploration
    const epsilon = Math.max(0.01, 0.3 - (this.state.performance.efficiency * 0.2));
    
    if (Math.random() < epsilon) {
      // Explore: random action
      return Math.floor(Math.random() * probabilities.length);
    } else {
      // Exploit: best action
      return probabilities.indexOf(Math.max(...probabilities));
    }
  }

  private interpretAction(actionIndex: number, prediction: tf.Tensor): Decision {
    const actions = ['move', 'collect', 'socialize', 'rest'] as const;
    const action = actions[actionIndex] || 'rest';
    
    // Get confidence from prediction
    const confidence = this.calculateConfidence(prediction, actionIndex);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(action, this.state);
    
    // Determine target if needed
    let target: { x: number; y: number } | undefined;
    if (action === 'move' || action === 'collect') {
      target = this.calculateOptimalTarget(action);
    }

    return {
      action,
      target,
      confidence,
      reasoning
    };
  }

  private calculateConfidence(prediction: tf.Tensor, actionIndex: number): number {
    // Calculate confidence based on prediction certainty
    return Math.min(0.95, Math.max(0.1, 
      prediction.dataSync()[actionIndex] + 
      (this.state.performance.efficiency * 0.2)
    ));
  }

  private generateReasoning(action: string, state: PenguinState): string {
    const reasons = {
      move: state.energy > 50 ? 
        "Exploring for new opportunities" : 
        "Moving to conserve energy",
      collect: state.happiness < 70 ? 
        "Collecting items to boost happiness" : 
        "Productive collection behavior",
      socialize: state.performance.socialInteractions < 5 ? 
        "Seeking social interaction" : 
        "Maintaining social bonds",
      rest: state.energy < 30 ? 
        "Resting to recover energy" : 
        "Strategic rest period"
    };
    
    return reasons[action as keyof typeof reasons] || "Following instinct";
  }

  private calculateOptimalTarget(action: string): { x: number; y: number } {
    // Smart target calculation based on AI learning
    const baseX = this.state.position.x;
    const baseY = this.state.position.y;
    
    if (action === 'collect') {
      // Move towards likely item spawn areas
      return {
        x: baseX + (Math.random() - 0.5) * 200,
        y: baseY + (Math.random() - 0.5) * 200
      };
    }
    
    // Default movement
    return {
      x: Math.max(50, Math.min(950, baseX + (Math.random() - 0.5) * 300)),
      y: Math.max(50, Math.min(650, baseY + (Math.random() - 0.5) * 300))
    };
  }

  private storeExperience(state: number[], action: number): void {
    // Store for experience replay
    if (this.experienceBuffer.length > 1000) {
      this.experienceBuffer.shift(); // Remove oldest experience
    }
    
    this.experienceBuffer.push({
      state,
      action,
      reward: 0, // Will be updated when we learn
      nextState: [] // Will be filled on next decision
    });
  }

  private updateInternalState(decision: Decision): void {
    // Update memory with recent actions
    this.state.memory.unshift(this.actionToNumber(decision.action));
    this.state.memory = this.state.memory.slice(0, 16);
    
    // Update current action
    this.state.currentAction = decision.action;
    
    // Energy management
    if (decision.action === 'rest') {
      this.state.energy = Math.min(100, this.state.energy + 5);
    } else {
      this.state.energy = Math.max(0, this.state.energy - 1);
    }
    
    // Happiness natural decay/growth
    this.state.happiness += (Math.random() - 0.5) * 2;
    this.state.happiness = Math.max(0, Math.min(100, this.state.happiness));
  }

  private actionToNumber(action: string): number {
    const mapping = { move: 0, collect: 1, socialize: 2, rest: 3 };
    return mapping[action as keyof typeof mapping] || 3;
  }

  private getDefaultDecision(): Decision {
    return {
      action: 'rest',
      confidence: 0.1,
      reasoning: "Fallback behavior due to AI error"
    };
  }

  async learn(reward: number): Promise<void> {
    try {
      // Update latest experience with reward
      if (this.experienceBuffer.length > 0) {
        this.experienceBuffer[this.experienceBuffer.length - 1].reward = reward;
      }
      
      // Update performance metrics
      this.updatePerformanceMetrics(reward);
      
      // Perform experience replay learning
      if (this.experienceBuffer.length >= 32) {
        await this.performExperienceReplay();
      }
      
    } catch (error) {
      console.error('Learning failed:', error);
    }
  }

  private updatePerformanceMetrics(reward: number): void {
    // Update efficiency based on recent performance
    const recentRewards = this.experienceBuffer
      .slice(-10)
      .map(exp => exp.reward)
      .filter(r => r !== 0);
    
    if (recentRewards.length > 0) {
      const avgReward = recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length;
      this.state.performance.efficiency = Math.max(0, Math.min(1, avgReward / 10));
    }
    
    // Update specific counters based on reward type
    if (reward > 5) {
      this.state.performance.fishCollected++;
    }
    if (reward > 10) {
      this.state.performance.yarnCollected++;
    }
    if (reward > 0 && this.state.currentAction === 'socialize') {
      this.state.performance.socialInteractions++;
    }
  }

  private async performExperienceReplay(): Promise<void> {
    try {
      // Sample random batch from experience buffer
      const batchSize = Math.min(32, this.experienceBuffer.length);
      const batch = this.sampleExperiences(batchSize);
      
      // Prepare training data
      const states = batch.map(exp => exp.state);
      const actions = batch.map(exp => exp.action);
      const rewards = batch.map(exp => exp.reward);
      
      // Train the model
      await this.model.trainOnBatch(states, actions, rewards);
      
    } catch (error) {
      console.error('Experience replay failed:', error);
    }
  }

  private sampleExperiences(batchSize: number): typeof this.experienceBuffer {
    const sampled = [];
    for (let i = 0; i < batchSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.experienceBuffer.length);
      sampled.push(this.experienceBuffer[randomIndex]);
    }
    return sampled;
  }

  // Public methods for external interaction
  public updatePosition(x: number, y: number): void {
    this.state.position = { x, y };
  }

  public updateHappiness(delta: number): void {
    this.state.happiness = Math.max(0, Math.min(100, this.state.happiness + delta));
  }

  public updateEnergy(delta: number): void {
    this.state.energy = Math.max(0, Math.min(100, this.state.energy + delta));
  }

  public getState(): PenguinState {
    return { ...this.state };
  }

  public async saveModel(): Promise<void> {
    await this.model.save(`penguin-ai-${this.penguinId}`);
  }

  public async loadModel(): Promise<void> {
    await this.model.load(`penguin-ai-${this.penguinId}`);
  }
}