FROM node:10-alpine

# Installs latest Chromium package.
RUN apk update && apk upgrade && \
    apk add --no-cache \
      chromium=81.0.4044.113-r0 \
      nss

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptr && adduser -S -g pptr pptr \
    && mkdir -p /home/pptr/e2e /home/pptr/Downloads \
    && chown -R pptr:pptr /home/pptr

# Run everything after as non-privileged user.
USER pptr

WORKDIR /home/pptr/e2e

COPY --chown=pptr package*.json ./

RUN npm install

COPY --chown=pptr . .

CMD [ "npm", "test" ]