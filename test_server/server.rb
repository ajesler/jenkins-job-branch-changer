require 'sinatra'
require 'fileutils'

CONFIG_FILE = "config.xml"

before do
	headers 'Access-Control-Allow-Origin' => '*'
	headers 'Access-Control-Allow-Credentials' => 'true'
	headers 'Access-Control-Allow-Methods' => 'GET,POST,OPTIONS'
	headers 'Access-Control-Allow-Headers' => 'origin,content-type,accept,Access-Control-Allow-Credentials'
	headers 'Cache-Control' => 'no-store, must-revalidate'
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
	"This is totally a jenkins server. Whats that behind you? *points*"
end

options '/view/All/job/:job/config.xml' do
	headers 'Allow' => 'GET,POST,OPTIONS'
	"Success!"
end

get '/view/All/job/:job/config.xml' do
	file = config_file_for(params[:job])
	ensure_exists(file)

	send_file file, :type => :xml
end

post '/view/All/job/:job/config.xml' do
	file = config_file_for(params[:job])
	ensure_exists(file)

	headers 'Content-Type' => 'text/plain'

	File.write(file, request.body.read)

	"Config file updated"
end

post '/job/:job/build' do
	headers 'Content-Type' => 'text/plain'

	"Triggered a build for #{params[:job]}"
end

get '/reset_configs' do
	FileUtils.rm Dir.glob("job_*_config.xml")

	headers 'Content-Type' => 'text/plain'
	"Configs have been reset"
end

# curl -X POST -d @example_config.xml http://localhost:4567/view/All/job/myJob/config.xml --header "Content-Type:text/xml"
# curl -X GET http://localhost:4567/reset_configs