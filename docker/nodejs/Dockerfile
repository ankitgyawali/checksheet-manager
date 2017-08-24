FROM node:latest
WORKDIR "/checksheet-manager/server"
CMD ["npm install -g pm2"]

ENTRYPOINT npm install -g pm2 && pm2 start server.js && bash
# CMD ["pm2", "logs""]
