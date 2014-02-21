require 'socket'
require 'thread'
require_relative 'retriever'

if ARGV.length != 1
  $stderr.puts("Usage: #{$0} <port>")
end

port = ARGV[0].to_i
mutex = Mutex.new
server = TCPServer.new('localhost', port)
pending_data = []

reader_thread = Thread.new do
  loop do
    latest = Retriever.get_latest
    mutex.synchronize do
      pending_data += latest
    end
  end
end

writer_thread = Thread.new do
  loop do
    socket = server.accept
    line = socket.readline
    $stdout.puts "received request: #{line}"

    content = nil
    mutex.synchronize do
      content = JSON.generate(pending_data)
      pending_data = []
    end

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
