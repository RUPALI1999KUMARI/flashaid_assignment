# Import CSV data to mongodb

## Instruction to run this project

### Step-1
Clone this project from github

### Step-2
Intall Dependencies
Run followinig command - npm i

### Step-3
Start the server (Make sure your are in UPLOADCSV Project)
Run followinig command - node index.js

If server everything is good you should get following logs in terminal
Your server running on port 3000
You have connected with your mongoDB

### Step-4
curl --location 'localhost:3000/uploadusers' \
--form 'file=@"/C:/Users/amank/Downloads/Users.csv"'

You can use above curl in postman or create new request with following end point with method type POST
localhost:3000/uploadusers

### Step-5
Upload csv in postman and run
a - In postman got to the body tab
b - select form-data
c - add fiels with name "file"
d - select field type file
e - select csv file from your system
f - hit the send button

If you have uploaded correct form of csv then all user from that csv should get stored in mongodb
and you will get 201 status code with following response
{
    "message": "All users are imported successfully",
    "status": true,
    "data": [
        {
            "fullName": "John Doe",
            "contact": "1234567890",
            "email": "john.doe@example.com",
            "dateOfBirth": "15-05-1990",
            "_id": "65bf51419d33807c22e79ebf"
        }]
}

### Step-6
To Verify Users from CSV have been stored successfully in db by making get all user requet

curl --location 'localhost:3000/users'

use above curl to get all user from db or add new request postman with this end point localhost:3000/users with type GET

You will get all Users from db whatever imported from CSV file

### Step-7
To Verify Duplicate emailid of user
As we know we created user from csv so if you upload same csv with same user then we should get 
error message of duplicacy
To verify repeat ### Step-5 you should get error message like that

If there is any duplicate error you will get this type of error message 

{
    "message": "User with duplicate email",
    "status": false,
    "duplicateUser": {
        "fullName": "John Doe",
        "contact": "1234567890",
        "email": "john.doe@example.com",
        "dateOfBirth": "15-05-1990",
        "_id": "65bf59d79d33807c22e79ef0"
    }
}

### Step-8
If you want to perform all opeartion again then create diffrenct csv with diffrent user OR delete all existing user from DB

curl --location --request DELETE 'localhost:3000/users'

use above curl to delete all user from DB
OR
add new request in postman with this endpoint - localhost:3000/users with type DELETE

After deleting all user you can proceed to perform all operation again