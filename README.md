This README file provides instructions on how to run the Lab Reservation App.

Prerequisites
Before running the Lab Reservation App, ensure you have the following installed on your system:

Node.js (version 14 or higher)
npm (Node Package Manager)
Installation
Clone the repository to your local machine:

bash
Copy code
git clone <repository_url>
Change your directory to the location of the app.js file using the terminal:

bash
Copy code
cd <path_to_app.js>
Install the required npm packages by running the following command in your terminal:

bash
Copy code
npm install bcrypt@^5.1.1 bcryptjs@^2.4.3 body-parser@^1.20.2 connect-flash@^0.1.1 ejs@^3.1.9 express@^4.19.2 express-handlebars@^7.1.2 express-session@^1.18.0 mongoose@^8.3.0 multer@^1.4.5-lts.1
Running the App
Once the dependencies are installed, you can run the Lab Reservation App using the following command:

bash
Copy code
node app.js
Accessing the App
After starting the app, open a web browser and navigate to the following URL:

bash
Copy code
http://localhost:3000/labs
This will take you to the starting page of the Lab Reservation App, where you can proceed with lab reservations.

Additional Notes
Ensure that MongoDB is running on your system, as the Lab Reservation App uses Mongoose to interact with the database.
You may need to customize certain configurations, such as database connection details, according to your environment setup. These configurations can typically be found in the app.js file or in separate configuration files within the project.
