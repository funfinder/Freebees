# Freebeez
Want something new?
Have something to give away? Try Freebeez.

[Freebees](https://freebeez.herokuapp.com/)

## Introduction 

This web application allows a user to post items that she/he wants to give away. Other users can see the posted items and their locations.

## Getting Started

We used bower and npm to install dependencies. Nodemon runs the server, and Mongod runs the local database. The bower dependencies are downloaded to a node_modules folder, which is pre-specified in the .bowerrc file. Before running locally, run the following code in the command line.
```
bower install
npm install
mongod
nodemon index.js
```

Note: To use mongod, you must set the database path. You can do so with the following command.
```
mongod --dbpath <path>
```

## File Structure

Files are organized in the following directories: Client and Server.

## Choice of Technologies

For this project, we used AngularJS for our front end and Node.js, Express, and MongoDB for our server and database.

We used MongoDB for the document storage of the item names and the item locations. We used an ORM called mongoose, which is an npm module, which gives us easier access to our database. Refer to this link to learn more about mongoose [Mongoose Doc](http://mongoosejs.com/). We used MongoLab as a heroku addon when delpoying our app.

## Google Maps API

We used Google Maps JavaScript API for our locations.[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)

## Features

- Users can add one item at a time with its physical address as location.
- Users can remove an item from the map  when it becomes unavailable.
- Users can use their location based on IP address.
- Users can search the database by item name.

## In progress

- Filter based on when item was submitted.
- Users can upload pictures along with their posting.

## Git Workflow

Please refer to the [CONTRIBUTING.md](_CONTRIBUTING.md) file to see our git workflow.

## Style Guide

Please refer to the [STYLE-GUIDE.md](_STYLE-GUIDE.md) file to see our style guide.

## Contributors
- Nadine Ott ([Nadine Ott](https://www.linkedin.com/in/nadineott))
- Elva Chao ([Elva Chao](https://www.linkedin.com/in/odekyc))
- Thomas Sorensen ([Thomas Sorensen](https://www.linkedin.com/in/sorensenthomas))
- Jason Cheung ([Jason Cheung](https://ca.linkedin.com/in/jasoncheung1))

