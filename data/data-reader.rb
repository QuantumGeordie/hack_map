require 'date'

if ARGV.length != 1
  $stderr.puts("Usage: #{$0} <data-directory>")
  exit 1
end

INTERVAL = 5
$directory = ARGV[0]
$port = ARGV[1].to_i


def file_time(file)
  file =~ /(\d+)/
  $1.to_i
end

def parse_time(line)
  DateTime.parse(line.split(',')[1].gsub(/\"/, ''))
end

def sort_lines(lines)
  lines.sort do |line1, line2|
    parse_time(line1) <=> parse_time(line2)
  end
end


unless Dir.exist?($directory)
  Dir.mkdir($directory)
end

latest = Time.now.to_i - 1000000
loop do
  files = Dir.glob("cache/#{$directory}/*.csv").sort do |file1, file2|
    file_time(file1) <=> file_time(file2)
  end

  current = files.select { |file| file_time(file) > latest }
  current.each do |file|
    sort_lines(File.readlines(file)).each do |line|
      $stdout.puts line
    end
    $stdout.flush
  end

  unless current.empty?
    latest = file_time(current.last)
  end

  sleep INTERVAL
end
