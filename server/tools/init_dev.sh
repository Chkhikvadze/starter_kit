#!/bin/bash

# migrate database
npm run mongo-migrate-run

# create user for each role
echo "Creating users ..."
roles=( caregiver patient researcher administrator superuser )
for i in "${roles[@]}"
do
	npm run create_user -- --email=$i@mail.com --username=dev_$i --password=password --role=$i
done