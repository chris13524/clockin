#!/usr/bin/env bash

set -e

git pull
docker-compose -p clockin build
docker-compose -p clockin up -d
