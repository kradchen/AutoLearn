FROM ubuntu:trusty
MAINTAINER KradChen <reinhard1203@163.com>
RUN sudo cp /etc/apt/sources.list /etc/apt/sources.list_backup
RUN sudo rm /etc/apt/sources.list -f 
RUN sudo cp /src/sources.list /etc/apt/sources.list
RUN sudo apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN node -v
ADD ./ src
EXPOSE 3000
WORKDIR /src
RUN npm install
WORKDIR /src/bin
CMD ["nodejs","www"]
