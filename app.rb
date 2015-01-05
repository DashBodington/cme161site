# app.rb
require 'sinatra'
# require 'sinatra/reloader'

# enable static files to be served outside of .public/ folder
set :public_folder, 'app'

get '/' do
  File.read(File.join('app','index.html'))
end

# # CRUD routes
# post '/' do
# #  .. create something ..
# end

# get '/' do
# #  .. read something ..
# end

# put '/' do
# #  .. update something ..
# end

# delete '/' do
# #  .. destroy something ..
# end