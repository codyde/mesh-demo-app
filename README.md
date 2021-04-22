# Cody's Kong Mesh/Kuma Demo Application

This application is a 4 tier application consisting of the following components

* ReactJS based frontend service
* Python Flask based API tier service
* PostgreSQL Database
* Redis Caching Tier (because all serious demo applications use Redis)

## Requirements

This application is tuned to be used in a Kuma/Kong Mesh environment. Update the environment variables within the API Tier's YAML definitions to clarify which mesh you
are deploying onto

## Overview

The frontend service makes calls to the api continuously to update the status boxes on the main page. You can only post messages once you have logged into the application.

**Default Login: `admin/admin`**

The login service issues a JWT token that can be used for OPA demonstrations at a later date. 

After logging in you can post messages to the board which should update to all clients currently connected.

## Features

* Encrypted database credentials leveraging the Python's Fernet library (very basic, token is in environment variables, **NOT SUITABLE FOR ANY LEVEL OF PROTECTION**)
* JWT token deployed and stored in the browser application store
* Insomnia API calls included in their folder for import
* Files included for cross-zone deployment (s1/s2 files)

# TODO

A whole lot of documentation and variable setting. Issue some PR's and help a dude out. 