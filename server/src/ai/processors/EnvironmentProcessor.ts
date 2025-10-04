export class EnvironmentProcessor {
  process(environmentData: any): any {
    if (!environmentData) {
      return this.getDefaultEnvironment();
    }

    return {
      nearestFishDistance: this.normalizeDistance(environmentData.nearestFish?.distance || 1000),
      nearestYarnDistance: this.normalizeDistance(environmentData.nearestYarn?.distance || 1000),
      nearestPenguinDistance: this.normalizeDistance(environmentData.nearestPenguin?.distance || 1000),
      crowdDensity: this.calculateCrowdDensity(environmentData.penguins || []),
      fishDensity: this.calculateItemDensity(environmentData.fish || []),
      yarnDensity: this.calculateItemDensity(environmentData.yarns || []),
      factoryMood: (environmentData.factoryMood || 70) / 100,
      turboMode: environmentData.turboMode ? 1 : 0,
      timeOfDay: this.getTimeOfDayFactor(),
      weatherFactor: this.getWeatherFactor()
    };
  }

  private getDefaultEnvironment(): any {
    return {
      nearestFishDistance: 1,
      nearestYarnDistance: 1,
      nearestPenguinDistance: 1,
      crowdDensity: 0,
      fishDensity: 0.3,
      yarnDensity: 0.1,
      factoryMood: 0.7,
      turboMode: 0,
      timeOfDay: 0.5,
      weatherFactor: 0.8
    };
  }

  private normalizeDistance(distance: number): number {
    return Math.min(1, distance / 500); // Normalize to 0-1 range
  }

  private calculateCrowdDensity(penguins: any[]): number {
    return Math.min(1, penguins.length / 10); // Max 10 penguins = 1.0 density
  }

  private calculateItemDensity(items: any[]): number {
    return Math.min(1, items.length / 20); // Max 20 items = 1.0 density
  }

  private getTimeOfDayFactor(): number {
    const hour = new Date().getHours();
    return Math.sin((hour / 24) * Math.PI * 2) * 0.5 + 0.5;
  }

  private getWeatherFactor(): number {
    // Simulate weather effects on penguin behavior
    return 0.5 + Math.sin(Date.now() / 600000) * 0.3; // Changes every 10 minutes
  }
}