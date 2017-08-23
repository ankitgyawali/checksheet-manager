FROM mongo
COPY initdb.json /initdb.json
CMD mongoimport --host mongodb --db ksm --collection root --type json --file /initdb.json --jsonArray