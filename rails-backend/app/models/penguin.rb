class Penguin < ApplicationRecord
  validates :name, presence: true
  validates :x, :y, presence: true, numericality: true
  validates :penguin_type, presence: true
  validates :behavior, presence: true
  validates :happiness, :energy, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }

  after_initialize :set_defaults, if: :new_record?

  private

  def set_defaults
    self.happiness ||= 50
    self.energy ||= 50
    self.x ||= rand(0.0..800.0)
    self.y ||= rand(0.0..600.0)
    self.penguin_type ||= 'yarn'
    self.behavior ||= 'exploring'
  end
end
