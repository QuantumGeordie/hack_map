if ARGV.length != 2
  $stderr.puts("Usage: #{$0} <hostname> <data-directory>")
  exit 1
end

INTERVAL = 60
$hostname = ARGV[0]
$directory = ARGV[1]

unless Dir.exist?($directory)
  Dir.mkdir($directory)
end

loop do
  puts "fetching new files"
  `rsync --archive --verbose --compress --delete -e 'ssh' #{$hostname}:doit/#{$directory} ./cache`

  puts "waiting #{INTERVAL} seconds"
  sleep INTERVAL
end
