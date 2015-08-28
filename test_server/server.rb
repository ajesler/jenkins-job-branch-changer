require 'sinatra'
require 'fileutils'

CONFIG_FILE = "config.xml"

before do
	headers 'Access-Control-Allow-Origin' => '*'
end

def config_file_for(job)
	return "job_#{job}_config.xml"
end

def ensure_exists(file)
	if !File.exists?(file)
		FileUtils.cp(CONFIG_FILE, file)
	end
end

get '/' do
	headers 'Content-Type' => 'text/plain'
	"Yay!"
end

get '/job/:job/config.xml' do
	file = config_file_for(params[:job])
	ensure_exists(file)

	send_file file, :type => :xml
end

post '/job/:job/config.xml' do
	file = config_file_for(params[:job])
	ensure_exists(file)
	
	headers 'Content-Type' => 'text/plain'

	File.write(file, request.body.read)

	"Config file updated"
end

post '/reset_configs' do
	Dir.glob("job_*_config.xml").each do |f| 
		FileUtils.cp(CONFIG_FILE, f)
	end

	headers 'Content-Type' => 'text/plain'
	"Configs have been reset"
end

# curl -X POST -d @example_config.xml http://localhost:4567/job/myJob/config.xml --header "Content-Type:text/xml"
# curl -X POST -d @example_config.xml http://localhost:4567/reset_configs