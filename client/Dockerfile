FROM node

COPY . /app
WORKDIR /app

RUN npm install
RUN ./node_modules/.bin/ng build --prod && \
    cp /app/dist/browser/index.html /tmp/app.html && \
    ./node_modules/.bin/ng run client:server && \
    ./node_modules/.bin/tsc -p server.tsconfig.json && \
    cd dist && \
    node prerender


FROM nginx

COPY --from=0 /app/dist/browser /usr/share/nginx/html
COPY --from=0 /tmp/app.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
