FROM nginx:1-alpine

RUN echo $'\n\
types {\n\
    application/wasm wasm;\n\
}' >> /etc/nginx/mime.types

COPY . /usr/share/nginx/html