class Api::V1::GameController < ApplicationController
  def status
    penguins = Penguin.all
    
    render json: {
      penguins_count: penguins.count,
      penguins: penguins.map { |p| penguin_summary(p) },
      game_state: 'active',
      timestamp: Time.current
    }
  end

  def create_penguin
    penguin = Penguin.new(penguin_params)
    
    if penguin.save
      render json: penguin, status: :created
    else
      render json: { errors: penguin.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def penguin_summary(penguin)
    {
      id: penguin.id,
      name: penguin.name,
      position: { x: penguin.x, y: penguin.y },
      type: penguin.penguin_type,
      behavior: penguin.behavior,
      happiness: penguin.happiness,
      energy: penguin.energy
    }
  end

  def penguin_params
    params.require(:penguin).permit(:name, :x, :y, :penguin_type, :behavior, :happiness, :energy)
  end
end
