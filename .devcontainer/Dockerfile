FROM --platform=linux/amd64 ghcr.io/flxbl-io/sfp-rc:alpha

COPY .bashrc /root/.bashrc
RUN sf autocomplete --refresh-cache

RUN apt-get update -y && apt-get install -y ruby-full build-essential zlib1g-dev
RUN gem install jekyll bundler && gem install just-the-docs