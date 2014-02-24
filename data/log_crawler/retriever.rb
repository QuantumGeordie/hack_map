require 'json'
require 'ipaddr'
require 'sqlite3'
require 'uri'
require 'net/http'

class Retriever

  def self.get_latest
    localTime = Time.new
    utcTime = localTime.getutc
    curDate = Time.new.gmtime.strftime("%Y.%m.%d")

    @db = SQLite3::Database.new "iptoloc" if @db.nil?
    @ip_to_coord = {} if @ip_to_coord.nil?
    json_hash = []

    logFile = "requests.log"
    difFile = "diff.log"
    posFile = "pos.log"

    puts "Retrieving log file"

    out = `rsync --compress login@server:~/requests.log #{logFile}`

    f1 = File.open(logFile)
    f2 = File.open(difFile, File::CREAT|File::TRUNC|File::RDWR)
    f3 = File.new(posFile, File::CREAT|File::RDWR)
    if f3.size == 0
      pos = 0
    else
      pos = f3.read.to_i
    end

    f1.pos = pos
    f1.each do |line|
      f2.write(line)
    end
    f3.rewind
    f3.write(f1.pos)

    ip_list = {}

    f2.rewind
    f2.each do |line|
      splitline = line.split(/\s/)

      timestamp         = splitline[0]
      ip_address        = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.match(line).to_s

      is_lign_ok    = !/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}/.match(timestamp).nil?
      date    = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}/.match(timestamp).to_s
      year    = date[0..3]
      month   = date[5..6]
      day     = date[8..9]
      time    = /[0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}/.match(timestamp).to_s
      hour    = time[0..1]
      minute  = time[3..4]
      second  = time[6..7]
      millisecond = time[9..11]

      ms_since_epoch = Time.new(year, month, day, hour, minute, second).to_i * 1000 + millisecond.to_i

      if is_lign_ok
        ip_list[ip_address] = [] if ip_list[ip_address].nil?
        ip_list[ip_address] << ms_since_epoch unless ip_list[ip_address].include?(ms_since_epoch)
      end
    end

    count = 0
    puts "New requests: #{ip_list.size} Ip addresses"
    ip_list.each do |ip, timestamps|
      lat = nil
      long = nil

      #puts "gets location"
      if @ip_to_coord[ip].nil?
        #puts "Mapping #{ip}"
        #lat, long = self.get_location(@db, ip)
        lat, long = self.get_location_web(ip)
        @ip_to_coord[ip] = [lat, long] unless lat.nil?
      end

      #puts "add to json"
      unless @ip_to_coord[ip].nil?
        rand_nb = rand(timestamps.size)
        new_timestamp = timestamps[rand_nb].to_i
        json_hash[count] = {"lat" => @ip_to_coord[ip][0], "lng" => @ip_to_coord[ip][1], "time" => new_timestamp, "magnitude" => 1, "type" => "request"}
        count += 1
      end
    end

    f1.close
    f2.close
    f3.close

    json_hash
  end

  def self.get_location(db, ip)

    begin
      ip_addr       = IPAddr.new ip
      ip_addr_long  = ip_addr.to_i
      sql = <<-SQL
        SELECT lt.latitude, lt.longitude
        FROM ips_table it
        LEFT JOIN loc_table lt ON lt.id = it.loc_id
        WHERE #{ip_addr_long} >= it.start_ip AND #{ip_addr_long} <= it.end_ip
      SQL

      results = db.execute(sql)

      [] << results[0][0] << results[0][1] unless results.empty?
    rescue
      []
    end
  end

  def self.get_location_web(ip)
    uri = URI.parse("http://freegeoip.net/json/#{ip}")
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)
    geo_info = response.body

    lat = nil
    long = nil
    if response.code == "200"
      geo_info_hash = JSON.parse(geo_info)
      lat = geo_info_hash["latitude"]
      long = geo_info_hash["longitude"]
    end

    [lat,long]
  end
end