require 'rails_helper'

RSpec.describe Penguin, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      penguin = Penguin.new(
        name: "Test Penguin",
        x: 100.0,
        y: 200.0,
        penguin_type: "yarn",
        behavior: "exploring"
      )
      expect(penguin).to be_valid
    end

    it "is invalid without a name" do
      penguin = Penguin.new(name: nil, x: 0, y: 0, penguin_type: "yarn", behavior: "test")
      expect(penguin).to_not be_valid
    end

    it "validates happiness is between 0 and 100" do
      penguin = Penguin.new(name: "Test", x: 0, y: 0, penguin_type: "yarn", behavior: "test", happiness: 150)
      expect(penguin).to_not be_valid
    end
  end

  describe "default values" do
    it "sets default happiness and energy" do
      penguin = Penguin.create!(
        name: "Default Penguin",
        x: 100.0,
        y: 200.0,
        penguin_type: "yarn",
        behavior: "exploring"
      )
      
      expect(penguin.happiness).to eq(50)
      expect(penguin.energy).to eq(50)
    end
  end
end
