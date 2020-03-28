FROM node:10-alpine

# Installs latest Chromium package.
RUN apk update && apk upgrade && \
    apk add --no-cache \
      chromium=79.0.3945.130-r0 \
      nss

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/e2e /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Run everything after as non-privileged user.
USER pptruser

WORKDIR /home/pptruser/e2e

COPY --chown=pptruser package*.json ./

RUN npm install

COPY --chown=pptruser . .

CMD [ "npm", "test" ]