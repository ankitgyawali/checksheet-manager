#Checksheet-manager

Checksheet-manager is a web application that allows an educational organization to keep track of their student's progress in their curriculum. Checksheet manager works by providing different levels of access controls to three different types of user: Root users, advisors(professors) and advisee(students).

Refer to this <a href="https://cdn.rawgit.com/ankitgyawali/checksheet-manager/gh-pages/index.html" target="_blank">documentation</a> if you need help with user interface. 

A demo of checksheet manager can be found at: <a href="http://kucm.ankitgyawali.com" target="_blank">kucm.ankitgyawali.com</a>

The login for all three levels of users are set temporarily to:

username:a

password: asdfgh

##How it works:
Checksheet manager utilizes REST API services, to create empty checksheet prototypes, instantiate accounts in hierarchial manner (root users add advisors, and advisors add students), and link students with empty checksheet so that they can maintain their checksheet througout their edcuational career.

##How to use:
Checksheet-manager has been designed in a way so that the students find it inituitive to use it. Tutorials are available throughout the web app. A detailed documentation on using checksheet-manager and discovering it features can be found <a href="https://cdn.rawgit.com/ankitgyawali/checksheet-manager/gh-pages/index.html" target="_blank">here</a>.

##Issues
Report all issues related to checksheet-manager on this separate <a href="https://github.com/ankitgyawali/checksheet-manager/issues" target="_blank">issue page</a>.

##How to build:
Checksheet manager runs as a node js application. Because we are running a web application and not traditional static files, we run node js with nginx. Running nginx and apache along side requires some researching into if you are switching from an apache only server. Below are the steps to build and run checksheet-manager on a debian based operating system. These steps were tested on Ubuntu 14.04 LTS.
Start off by cloning the repository with: 

```git clone https://github.com/ankitgyawali/checksheet-manager.git```

Install Node JS, Mongo DB and PM2 on your system. Heres a quick little script that installs node:
````
sudo apt-get update
sudo apt-get install git
cd ~
wget https://nodejs.org/dist/v4.2.3/node-v4.2.3-linux-x64.tar.gz
mkdir node
tar xvf node-v*.tar.gz --strip-components=1 -C ./node
cd ~
rm -rf node-v*
mkdir node/etc
echo 'prefix=/usr/local' > node/etc/npmrc
sudo mv node /opt/
sudo chown -R root: /opt/node
sudo ln -s /opt/node/bin/node /usr/local/bin/node
sudo ln -s /opt/node/bin/npm /usr/local/bin/npm
````

At this point `node -v` should give you the version of node js.

Set up your server's private ip address on checksheet-manager/server/server.js.
You can get your private ip address if its set up by: `curl -w "\n" http://169.254.169.254/metadata/v1/interfaces/private/0/ipv4/address`
While you are at it, you could set up the name of your institution on checksheet manager. You can do so by modifying the cmTitle parameter on checksheet-manager/client/configuration.js.

Install pm2:

````
sudo npm install pm2 -g
pm2 startup ubuntu
cd checksheet-manager/server
pm2 start server
````

At this point you should have node.js and pm2 installed. We now need mongodb(for database) and nginx(to run the app) on our system.
There is a guide to install mongodb which can be found <a href="https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/" target="_blank">here</a>.
Once you are done start mongod by running, `sudo service mongod start` and make sure the service is running by running, `sudo service mongod status`.

Finall to install nginx, run: `sudo apt-get install nginx`.
Modify your nginx parameters via: `sudo vi /etc/nginx/sites-available/default`
The default config should look somthing similar to this:
````
server {
    listen 80;

    server_name yourservername.com;

    location / {
        proxy_pass http://APP_PRIVATE_IP_ADDRESS:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
````
Restart nginx service with `sudo service nginx restart`. To instantiate your first root user to be able to populate more accounts, you need to insert your first root user via mongo shell. To do this execute `mongo` to enter the mongo shell(look for 'robomongo' if you dont want to learn mongo shell) and execute the following commands:
````
use ksm
db.createCollection("root");
db.root.insert({"username":"root","password":"rootPassw0rd"})
````
This will instantiate your first root user and you can add more accounts from that root account. You should be all set and ready to go with the login information you just inserted to the mongo database(username: root and password: rootPassw0rd).

