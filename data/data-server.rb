require 'socket'
require 'thread'

class EventObject

  attr_reader :time, :longitude, :latitude, :magnitude, :type

  def initialize(time, longitude, latitude, type)
    @time = time.strip
    @longitude = longitude.strip
    @latitude = latitude.strip
    @magnitude = 1.0
    @type = type
  end

  def to_s
    <<eos
{
  "time":#{@time.to_i},
  "lat":#{@latitude},
  "lng":#{@longitude},
  "magnitude":#{@magnitude},
  "type":"#{@type}"
}
eos
  end
end

if ARGV.length != 2
  $stderr.puts("Usage: #{$0} <port> <event-type>")
end

port = ARGV[0].to_i
event_type = ARGV[1].to_i
mutex = Mutex.new
server = TCPServer.new('localhost', port)
pending_data = []

reader_thread = Thread.new do
  $stdin.each_line do |line|
    mutex.synchronize do
      fields = line.split(',')
      pending_data << EventObject.new(fields[0], fields[1], fields[2], event_type)
    end
  end
end

writer_thread = Thread.new do
  loop do
    socket = server.accept
    line = socket.readline
    $stdout.puts "received request: #{line}"

    data = nil
    mutex.synchronize do
      data = pending_data
      pending_data = []
    end

    puts "responding with #{data.count} JSON objects"
    puts

    content = '['
    content << data.join(",\n")
    content << ']'

    response = "HTTP/1.0 200 OK\n"
    response << "Content-Type: application/json\n"
    response << "Content-Length: #{content.length}"
    response << "\n\n"
    response << content

    socket.puts(response)
    socket.close
  end
end

[reader_thread, writer_thread].each { |thread| thread.join }
