class MapController < ApplicationController
  def index
  end

  def get_data
    respond_to do |format|
      format.json do
        render :json => get_latest
      end
    end
  end

  private

  def get_latest
    localTime = Time.new
    utcTime = localTime.getutc
    curDate = Time.new.gmtime.strftime("%Y.%m.%d")

    json_hash = []

    servers = ["prod1", "prod2", "prod3"]
    #servers = ["prod2"]
    servers.each do |server|
      logFile = "#{server}.log"
      difFile = "#{server}_diff.log"
      posFile = "#{server}_pos.log"

      out = `rsync ehawkins@log1.core.densd.appfolio.net:/var/log/HOSTS/densd/#{server}/#{curDate}/appfolio #{logFile}`

      f1 = File.open(logFile)
      f2 = File.open(difFile, "w")
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

      reqstr = `grep nginx #{difFile} | grep -v localhost`
      requests = reqstr.split(/\n/)

      ip_list = {}

      requests.each do |line|
        splitline = line.split(/\s/)

        timestamp         = splitline[0]
        ip_address        = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.match(line).to_s

        date    = /[0-9]{4}\-[0-9]{2}\-[0-9]{2}/.match(timestamp).to_s
        year    = date[0..3]
        month   = date[5..6]
        day     = date[8..9]
        time    = /[0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}/.match(timestamp).to_s
        hour    = time[0..1]
        minute  = time[3..4]
        second  = time[6..7].to_f + time[9..11].to_f/1000

        ms_since_epoch = Time.new(year, month, day, hour, minute, second).to_i

        ip_list[ip_address] = [] if ip_list[ip_address].nil?
        ip_list[ip_address] << ms_since_epoch unless ip_list[ip_address].include?(ms_since_epoch)
      end

      count = 0

      ip_list.each do |ip, timestamps|
        uri = URI.parse("http://freegeoip.net/json/#{ip}")
        http = Net::HTTP.new(uri.host, uri.port)
        request = Net::HTTP::Get.new(uri.request_uri)
        response = http.request(request)
        geo_info = response.body

        if response.code == "200"
          geo_info_hash = JSON.parse(geo_info)
          lat = geo_info_hash["latitude"]
          long = geo_info_hash["longitude"]

          timestamps.each do |ts|
            json_hash[count] = {"lat" => lat, "lng" => long, "time" => ts, "magnitude" => 0.5, "type" => "request"}
            puts json_hash[count]
            count += 1
          end
        end
      end


    end

    json_hash.sort_by { |hsh| hsh["time"]}
    json_out = JSON.generate(json_hash)
    json_out
  end
end
