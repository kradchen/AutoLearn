FROM ubuntu:trusty
MAINTAINER KradChen <reinhard1203@163.com>
RUN wget  http://curl.haxx.se/download/curl-7.38.0.tar.gz

RUN tar -xzvf curl-7.38.0.tar.gz
RUN cd curl-7.38.0
RUN ./configure
RUN make
RUN make install
//RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN node -v
ADD ./ src
EXPOSE 3000
WORKDIR /src
RUN npm install
WORKDIR /src/bin
CMD ["nodejs","www"]
