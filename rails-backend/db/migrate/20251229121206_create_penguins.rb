class CreatePenguins < ActiveRecord::Migration[8.1]
  def change
    create_table :penguins do |t|
      t.string :name
      t.float :x
      t.float :y
      t.string :penguin_type
      t.string :behavior
      t.integer :happiness
      t.integer :energy

      t.timestamps
    end
  end
end
