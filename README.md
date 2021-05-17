# Cody's Kong Mesh/Kuma Demo Application

![App Demo](AppDemo.gif)

This application is a 4 tier application consisting of the following components

* Frontend - ReactJS based Frontend setup to allow authentication and return JWT tokens
* Posts-Service - Python Flask based tier handling posts to the messaging component on the main page
* User-service - Python Flask based tier handling all user data including creation/deletion of users and login logic
* PostgreSQL Database
* Redis Caching Tier (because all serious demo applications use Redis)

## Requirements

This application is tuned to be used in a Kuma/Kong Mesh environment. The application leverages a ConfigMap with all the specific configuration details within it. Make sure you are updating this ConfigMap with your own values before deploying. 

## Overview

The frontend service makes calls to both the POSTS service and USER service continuously. The POSTS service leverages a socket to keep consistent communication between all currently logged in users. The POSTS service sends POST data to the Redis message queue which then dispatches the completed job to Postgers. USER service data interaction is between the Frontend, USERS service, and Postgres.

**Default Login: `admin/admin`**

The login service issues a JWT token that can be used for OPA demonstrations.

After logging in you can post messages to the board which should update to all clients currently connected.

## Features

* Encrypted database credentials leveraging the Python's Fernet library (very basic, token is in environment variables, **NOT SUITABLE FOR ANY LEVEL OF PROTECTION**)
* JWT token deployed and stored in the browser application store
* Insomnia API calls included in their folder for import
* Files included for cross-zone deployment (s1/s2 files)

# TODO

A whole lot of documentation and variable setting. Issue some PR's and help a dude out.