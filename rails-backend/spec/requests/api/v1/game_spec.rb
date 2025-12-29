require 'rails_helper'

RSpec.describe "Api::V1::Game", type: :request do
  describe "GET /api/v1/game/status" do
    it "returns game status with no penguins" do
      get "/api/v1/game/status"
      
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response["penguins_count"]).to eq(0)
      expect(json_response["penguins"]).to be_an(Array)
      expect(json_response["game_state"]).to eq("active")
    end

    it "returns game status with penguins" do
      Penguin.create!(
        name: "Test Penguin",
        x: 100.0,
        y: 200.0,
        penguin_type: "yarn",
        behavior: "exploring"
      )
      
      get "/api/v1/game/status"
      
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response["penguins_count"]).to eq(1)
      expect(json_response["penguins"].first["name"]).to eq("Test Penguin")
    end
  end

  describe "POST /api/v1/game/penguins" do
    it "creates a new penguin" do
      penguin_params = {
        penguin: {
          name: "New Penguin",
          x: 150.0,
          y: 250.0,
          penguin_type: "yarn",
          behavior: "collecting"
        }
      }
      
      post "/api/v1/game/penguins", params: penguin_params
      
      expect(response).to have_http_status(:created)
      
      json_response = JSON.parse(response.body)
      expect(json_response["name"]).to eq("New Penguin")
      expect(json_response["x"]).to eq(150.0)
    end

    it "returns error for invalid penguin" do
      penguin_params = {
        penguin: {
          name: "",
          x: 150.0,
          y: 250.0
        }
      }
      
      post "/api/v1/game/penguins", params: penguin_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      
      json_response = JSON.parse(response.body)
      expect(json_response["errors"]).to be_present
    end
  end
end
