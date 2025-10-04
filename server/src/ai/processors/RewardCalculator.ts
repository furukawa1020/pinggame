export class RewardCalculator {
  calculateReward(action: string, result: any, penguinState: any): number {
    let reward = 0;

    // Base reward for different actions
    switch (action) {
      case 'collect':
        reward += this.calculateCollectionReward(result);
        break;
      case 'socialize':
        reward += this.calculateSocialReward(result, penguinState);
        break;
      case 'move':
        reward += this.calculateMovementReward(result, penguinState);
        break;
      case 'rest':
        reward += this.calculateRestReward(penguinState);
        break;
    }

    // Efficiency bonus
    reward += this.calculateEfficiencyBonus(penguinState);

    // Happiness factor
    reward *= this.getHappinessFactor(penguinState.happiness);

    // Energy consideration
    reward *= this.getEnergyFactor(penguinState.energy);

    return Math.max(-10, Math.min(10, reward)); // Clamp between -10 and 10
  }

  private calculateCollectionReward(result: any): number {
    let reward = 0;

    if (result.fishCollected) {
      reward += 5; // Base fish reward
      reward += result.fishCollected * 2; // Quantity bonus
    }

    if (result.yarnCollected) {
      reward += 10; // Base yarn reward (more valuable)
      reward += result.yarnCollected * 3; // Quantity bonus
    }

    return reward;
  }

  private calculateSocialReward(result: any, penguinState: any): number {
    let reward = 0;

    // Reward for successful social interactions
    if (result.socialSuccess) {
      reward += 3;
      
      // Bonus for penguins with low social interaction history
      if (penguinState.performance.socialInteractions < 5) {
        reward += 2;
      }
    }

    // Penalty for failed social attempts
    if (result.socialFailure) {
      reward -= 1;
    }

    return reward;
  }

  private calculateMovementReward(result: any, penguinState: any): number {
    let reward = 0;

    // Reward efficient movement
    if (result.reachedTarget) {
      reward += 1;
    }

    // Penalty for excessive movement when energy is low
    if (penguinState.energy < 30 && result.distance > 100) {
      reward -= 2;
    }

    // Bonus for exploration
    if (result.newAreaExplored) {
      reward += 1.5;
    }

    return reward;
  }

  private calculateRestReward(penguinState: any): number {
    let reward = 0;

    // Reward resting when energy is low
    if (penguinState.energy < 30) {
      reward += 3;
    } else if (penguinState.energy > 80) {
      // Slight penalty for resting when full energy
      reward -= 0.5;
    } else {
      reward += 1; // Moderate reward for strategic rest
    }

    return reward;
  }

  private calculateEfficiencyBonus(penguinState: any): number {
    const efficiency = penguinState.performance.efficiency || 0;
    return efficiency * 2; // Up to 2 points for high efficiency
  }

  private getHappinessFactor(happiness: number): number {
    // Happiness affects reward sensitivity
    return 0.5 + (happiness / 100) * 0.5; // Range: 0.5 to 1.0
  }

  private getEnergyFactor(energy: number): number {
    // Energy affects reward processing
    if (energy < 20) {
      return 0.7; // Reduced reward processing when very tired
    } else if (energy > 80) {
      return 1.2; // Enhanced reward processing when energetic
    }
    return 1.0;
  }

  // Special reward calculations
  calculateAchievementReward(achievement: string): number {
    const achievements = {
      'first_fish': 5,
      'fish_streak_5': 8,
      'fish_streak_10': 15,
      'yarn_collector': 20,
      'social_butterfly': 10,
      'explorer': 12,
      'efficiency_master': 25,
      'happy_penguin': 8
    };

    return achievements[achievement as keyof typeof achievements] || 0;
  }

  calculatePenaltyReward(penalty: string): number {
    const penalties = {
      'collision': -3,
      'stuck': -2,
      'energy_depletion': -5,
      'unhappiness': -4,
      'inefficiency': -6
    };

    return penalties[penalty as keyof typeof penalties] || 0;
  }
}