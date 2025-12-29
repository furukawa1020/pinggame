class Api::V1::HealthController < ApplicationController
  def index
    render json: {
      status: 'OK',
      message: '🧶 Yarn Penguin Rails API Server is running!',
      timestamp: Time.current,
      version: '1.0.0'
    }
  end
end
