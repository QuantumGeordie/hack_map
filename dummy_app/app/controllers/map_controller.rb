class MapController < ApplicationController
  def index
  end

  def get_data
    respond_to do |format|
      format.json do
        render :json =>
        '[{"time":13425234,"lat":39.5,"lng":-98.35,"magnitude":0.1,"type":"balls1"},{"time":13426234,"lat":40.5,"lng":-98.35,"magnitude":0.5,"type":"balls2"},{"time":13427234,"lat":41.5,"lng":-98.35,"magnitude":0.75,"type":"balls3"},{"time":13428234,"lat":42.5,"lng":-98.35,"magnitude":1,"type":"balls4"},{"time":13429234,"lat":43.5,"lng":-98.35,"magnitude":1,"type":"balls5"}]'

      end
    end
  end
end
