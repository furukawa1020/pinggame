require 'rails_helper'

RSpec.describe "Api::V1::Health", type: :request do
  describe "GET /api/v1/health" do
    it "returns a successful health check" do
      get "/api/v1/health"
      
      expect(response).to have_http_status(:success)
      
      json_response = JSON.parse(response.body)
      expect(json_response["status"]).to eq("OK")
      expect(json_response["message"]).to include("Yarn Penguin")
      expect(json_response["version"]).to eq("1.0.0")
    end
  end
end
