FROM mongo
COPY initroot.json /initroot.json
CMD mongoimport --host mongodb --db ksm --collection root --type json --file /initroot.json --jsonArray
COPY initadvisor.json /initadvisor.json
CMD mongoimport --host mongodb --db ksm --collection advisor --type json --file /initadvisor.json --jsonArray