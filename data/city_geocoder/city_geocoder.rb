require 'date'

class CityLocation

  attr_reader :city, :state

  def initialize(city, state)
    @city = city.strip.downcase
    @state = state.strip.downcase
  end

  def eql?(other)
    @city == other.city && @state == other.state
  end

  def hash
    @city.hash + @state.hash
  end

  def to_s
    "<#{city}, #{state}>"
  end
end

class GeoLocation

  attr_reader :longitude, :latitude

  def initialize(longitude, latitude)
    @longitude = longitude.strip
    @latitude = latitude.strip
  end
end


if ARGV.length != 1
  puts "Usage: #{$0} <geo-database>"
  exit 1
end

database = {}
state_fallbacks = {}
database_name = ARGV[0]
File.open(database_name, 'r+').each_line do |line|
  fields = line.split(',')
  state = fields[0]
  city = fields[2]
  city_location = CityLocation.new(city, state)

  latitude = fields[6]
  longitude = fields[7]
  geo_location = GeoLocation.new(longitude, latitude)

  database[city_location] = geo_location
  state_fallbacks[city_location.state] ||= geo_location
end

$stdin.each_line do |line|
  fields = line.gsub(/\"/, '').split(',')
  time = fields[1].strip

  city = fields[2]
  state = fields[3]
  city_location = CityLocation.new(city, state)

  geo_location = database[city_location]
  if geo_location.nil?
    $stderr.puts("missing location: #{city_location}, falling back to state location")
    geo_location = state_fallbacks[city_location.state]
  else
    $stdout.puts "#{DateTime.parse(time).to_time.to_i},#{geo_location.longitude},#{geo_location.latitude}"
    $stdout.flush
  end
end
