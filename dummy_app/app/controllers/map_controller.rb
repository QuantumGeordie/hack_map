require 'net/http'
require 'uri'
require 'json'
require 'ipaddr'

class MapController < ApplicationController

  DATA_SOURCES = {:epayments => 30102, :requests => 30103, :transactions => 30104}

  def index
  end

  def get_data
    respond_to do |format|
      format.json do
        render :json => get_latest_data
      end
    end
  end

  private

  def get_latest_data
    json_events = []
    DATA_SOURCES.each_pair do |type, port|
      Rails.logger.info("obtaining data: #{type}")
      json_events += get_latest_from_port(port)
    end
    prepare_json_response(json_events)
  end

  def get_latest_from_port(port)
    url = URI.parse("http://localhost:#{port}/index.htm")
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port) { |http| http.request(req) }
    JSON.parse(res.body) rescue []
  end

  def prepare_json_response(json_events)
    JSON.generate(sort_events(json_events))
  end

  def sort_events(json_events)
    json_events.sort do |event1, event2|
      event1['time'].to_i <=> event2['time'].to_i
    end
  end
end
