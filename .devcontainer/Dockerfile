FROM --platform=linux/amd64 ghcr.io/dxatscale/sfpowerscripts:latest

COPY .bashrc /root/.bashrc
RUN sfdx autocomplete --refresh-cache && sf autocomplete --refresh-cache